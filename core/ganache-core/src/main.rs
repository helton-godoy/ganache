use axum::{http::StatusCode, routing::get, Json, Router};
use ganache_api::{
    models::git_commit::{GitCommit, GitDiff},
    AdJoinRequest, AdJoinResponse, AdStatus, BootEnvironment, BootEnvironmentActivation,
    ClusterConfig, ClusterStatus, DatasetConfig, DatasetInfo, HardwareInfo, PoolConfig, PoolInfo,
    RollbackRequest, RollbackResponse, StorageDevice, SystemResources,
};
use ganache_lib::{
    AdService, BootService, ClusterService, ConfigDb, HardwareService, MemoryService, ZpoolService,
};
mod auth;
mod services;
use auth::AuthenticatedUser;
use serde::{Deserialize, Serialize};
use services::{git_history_service::GitHistoryService, git_service::GitServiceIntegration};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing::{info, warn};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use std::env;
use std::fs;

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
struct SystemLog {
    id: String,
    timestamp: String,
    level: String,
    message: String,
}

#[derive(Serialize, Deserialize, utoipa::ToSchema, Clone)]
struct DiskInfo {
    id: String,
    serial: String,
    size: String,
    status: String,
    node_id: String,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Initialize git repository for configuration versioning
    GitServiceIntegration::init();

    #[derive(OpenApi)]
    #[openapi(
        paths(
            get_hardware_info,
            configure_cluster,
            get_cluster_status,
            simulate_failure,
            get_system_resources,
            get_boot_environments,
            activate_boot_environment,
            get_drbd_devices,
            create_pool,
            get_pools,
            get_system_logs,
            promote_node,
            list_disks,
            list_datasets,
            create_dataset,
            destroy_dataset,
            heartbeat,
            get_config_history,
            get_commit_diff,
            rollback_config,
            join_ad_domain,
            get_ad_status,
            leave_ad_domain
        ),
        components(schemas(
            ganache_api::HardwareInfo,
            ganache_api::ClusterConfig,
            ganache_api::ClusterStatus,
            ganache_api::SystemResources,
            ganache_api::BootEnvironment,
            ganache_api::BootEnvironmentActivation,
            ganache_api::PoolConfig,
            ganache_api::PoolInfo,
            ganache_api::PoolConfig,
            ganache_api::PoolInfo,
            ganache_api::StorageDevice,
            ganache_api::DatasetConfig,
            ganache_api::DatasetInfo,
            ganache_api::models::git_commit::GitCommit,
            ganache_api::models::git_commit::GitDiff,
            ganache_api::models::git_commit::GitFileDiff,
            ganache_api::RollbackRequest,
            ganache_api::RollbackResponse,
            ganache_api::AdJoinRequest,
            ganache_api::AdJoinResponse,
            ganache_api::AdStatus,
            SystemLog,
            DiskInfo
        ))
    )]
    struct ApiDoc;

    let args: Vec<String> = env::args().collect();
    if args.len() > 1 && args[1] == "--export-openapi" {
        let json = ApiDoc::openapi().to_pretty_json().unwrap();
        let path = "../../docs/openapi.json";
        fs::write(path, json).expect("Unable to write openapi.json");
        println!("OpenAPI spec exported to {}", path);
        return;
    }

    info!("Starting Ganache Core System...");
    let _defaults = MemoryService::apply_arc_tuning().await;

    // Enforce 90% hard quota on all pools on boot
    if let Err(e) = enforce_quotas_on_all_pools().await {
        warn!("Failed to enforce some ZFS quotas at startup: {}", e);
    }

    // Start Cluster Heartbeat Monitor
    tokio::spawn(ClusterService::start_monitor_loop());

    let app = Router::new()
        .route("/api/v1/system/hardware", get(get_hardware_info))
        .route("/api/v1/system/resources", get(get_system_resources))
        .route(
            "/api/v1/cluster/configure",
            axum::routing::post(configure_cluster),
        )
        .route("/api/v1/cluster/status", get(get_cluster_status))
        .route(
            "/api/v1/cluster/simulate-failure",
            axum::routing::post(simulate_failure),
        )
        .route("/api/v1/cluster/heartbeat", axum::routing::post(heartbeat))
        .route(
            "/api/v1/system/boot-environments",
            get(get_boot_environments),
        )
        .route(
            "/api/v1/system/boot-environments/activate",
            axum::routing::post(activate_boot_environment),
        )
        .route("/api/v1/storage/drbd-devices", get(get_drbd_devices))
        .route(
            "/api/v1/storage/create-pool",
            axum::routing::post(create_pool),
        )
        .route("/api/v1/storage/pools", get(get_pools))
        .route("/api/v1/system/logs", get(get_system_logs))
        .route("/api/v1/system/promote", axum::routing::post(promote_node))
        .route("/api/v1/storage/disks", get(list_disks))
        .route(
            "/api/v1/storage/datasets",
            get(list_datasets).post(create_dataset),
        )
        .route(
            "/api/v1/storage/datasets/delete",
            axum::routing::post(destroy_dataset),
        )
        .route("/api/v1/config/history", get(get_config_history))
        .route(
            "/api/v1/config/history/{commit_id}/diff",
            get(get_commit_diff),
        )
        .route(
            "/api/v1/config/rollback",
            axum::routing::post(rollback_config),
        )
        .route("/api/v1/ad/join", axum::routing::post(join_ad_domain))
        .route("/api/v1/ad/status", get(get_ad_status))
        .route("/api/v1/ad/leave", axum::routing::post(leave_ad_domain))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 3005));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[utoipa::path(get, path = "/api/v1/system/hardware", responses((status = 200, description = "Hardware Detection Results", body = HardwareInfo)))]
async fn get_hardware_info() -> Json<HardwareInfo> {
    let info = HardwareService::detect_raid_controller().unwrap();
    Json(info)
}

#[utoipa::path(get, path = "/api/v1/system/resources", responses((status = 200, description = "Current System Resources and ARC Target", body = SystemResources)))]
async fn get_system_resources() -> Json<SystemResources> {
    let stats = MemoryService::apply_arc_tuning().await;
    Json(stats)
}

#[utoipa::path(post, path = "/api/v1/cluster/configure", request_body = ClusterConfig, responses((status = 200, description = "Cluster Configuration Started", body = ClusterStatus)))]
async fn configure_cluster(
    user: AuthenticatedUser,
    Json(mut payload): Json<ClusterConfig>,
) -> Json<ClusterStatus> {
    if std::env::var("GANACHE_DEV_MODE").is_ok() {
        info!("Enabling DEV MODE overrides via GANACHE_DEV_MODE environment variable");
        payload.dev_mode = true;
    }
    let status = ClusterService::configure_node(payload.clone())
        .await
        .unwrap();
    if let Err(e) = ConfigDb::save_and_commit(
        "cluster.json",
        &payload,
        &user.username,
        "update",
        "cluster configuration",
    ) {
        warn!("Failed to persist cluster configuration: {}", e);
    }
    Json(status)
}

#[utoipa::path(get, path = "/api/v1/cluster/status", responses((status = 200, description = "Cluster Status successfully retrieved", body = ClusterStatus)))]
async fn get_cluster_status() -> Json<ClusterStatus> {
    let status = ClusterService::get_status().await.unwrap();
    Json(status)
}

#[utoipa::path(post, path = "/api/v1/cluster/simulate-failure", responses((status = 200, description = "Failure Simulated", body = ClusterStatus)))]
async fn simulate_failure() -> Json<ClusterStatus> {
    let status = ClusterService::simulate_failure().await.unwrap();
    Json(status)
}

#[utoipa::path(post, path = "/api/v1/cluster/heartbeat", responses((status = 200, description = "Heartbeat Received")))]
async fn heartbeat() -> StatusCode {
    ClusterService::update_heartbeat();
    StatusCode::OK
}

#[utoipa::path(get, path = "/api/v1/system/boot-environments", responses((status = 200, description = "List of Boot Environments", body = Vec<BootEnvironment>)))]
async fn get_boot_environments() -> Json<Vec<ganache_api::BootEnvironment>> {
    let list = BootService::list_boot_environments().unwrap();
    Json(list)
}

#[utoipa::path(post, path = "/api/v1/system/boot-environments/activate", request_body = BootEnvironmentActivation, responses((status = 200, description = "Boot Environment Activated", body = String)))]
async fn activate_boot_environment(Json(payload): Json<BootEnvironmentActivation>) -> Json<String> {
    let result = BootService::activate_boot_environment(&payload.name).unwrap();
    GitServiceIntegration::commit_system("activate", &format!("boot environment {}", payload.name));
    Json(result)
}

#[utoipa::path(get, path = "/api/v1/storage/drbd-devices", responses((status = 200, description = "List of available DRBD devices", body = Vec<StorageDevice>)))]
async fn get_drbd_devices() -> Json<Vec<ganache_api::StorageDevice>> {
    let devices = ZpoolService::get_drbd_devices().await.unwrap();
    Json(devices)
}

#[utoipa::path(post, path = "/api/v1/storage/create-pool", request_body = PoolConfig, responses((status = 200, description = "Pool Created", body = PoolInfo)))]
async fn create_pool(
    user: AuthenticatedUser,
    Json(payload): Json<ganache_api::PoolConfig>,
) -> Json<ganache_api::PoolInfo> {
    let pool = ZpoolService::create_pool(payload.clone()).await.unwrap();
    if let Err(e) = ConfigDb::save_and_commit(
        &format!("pool_{}.json", pool.name),
        &payload,
        &user.username,
        "create",
        &format!("pool {}", pool.name),
    ) {
        warn!("Failed to persist pool configuration: {}", e);
    }
    Json(pool)
}

#[utoipa::path(get, path = "/api/v1/storage/pools", responses((status = 200, description = "List of all storage pools", body = Vec<PoolInfo>)))]
async fn get_pools() -> Json<Vec<ganache_api::PoolInfo>> {
    let pools = ZpoolService::list_pools().await.unwrap();
    Json(pools)
}

#[utoipa::path(get, path = "/api/v1/system/logs", responses((status = 200, description = "System Event Logs", body = Vec<SystemLog>)))]
async fn get_system_logs() -> Json<Vec<SystemLog>> {
    Json(vec![SystemLog {
        id: "stub-1".to_string(),
        timestamp: "2025-12-18T12:00:00Z".to_string(),
        level: "INFO".to_string(),
        message: "System initialized".to_string(),
    }])
}

#[utoipa::path(post, path = "/api/v1/system/promote", responses((status = 200, description = "Node Promoted Sucessfully", body = String)))]
async fn promote_node() -> Result<Json<String>, (StatusCode, String)> {
    info!("Manual promotion trigger received");
    match ClusterService::promote_peer().await {
        Ok(_) => {
            GitServiceIntegration::commit_system("promote", "manual failover trigger");
            Ok(Json("Node promoted successfully".to_string()))
        }
        Err(e) => {
            warn!("Promotion failed: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
        }
    }
}

#[utoipa::path(get, path = "/api/v1/storage/disks", responses((status = 200, description = "List of all disks", body = Vec<DiskInfo>)))]
async fn list_disks() -> Json<Vec<DiskInfo>> {
    Json(vec![
        DiskInfo {
            id: "d1".into(),
            serial: "SAMSUNG-MZ7L3".into(),
            size: "1.92TB".into(),
            status: "available".into(),
            node_id: "node-a".into(),
        },
        DiskInfo {
            id: "d2".into(),
            serial: "SAMSUNG-MZ7L3".into(),
            size: "1.92TB".into(),
            status: "available".into(),
            node_id: "node-a".into(),
        },
        DiskInfo {
            id: "d3".into(),
            serial: "INTEL-SSD-S45".into(),
            size: "960GB".into(),
            status: "available".into(),
            node_id: "node-a".into(),
        },
        DiskInfo {
            id: "d4".into(),
            serial: "INTEL-SSD-S45".into(),
            size: "960GB".into(),
            status: "available".into(),
            node_id: "node-a".into(),
        },
        DiskInfo {
            id: "d5".into(),
            serial: "MICRON-5300".into(),
            size: "1.92TB".into(),
            status: "available".into(),
            node_id: "node-b".into(),
        },
        DiskInfo {
            id: "d6".into(),
            serial: "MICRON-5300".into(),
            size: "1.92TB".into(),
            status: "available".into(),
            node_id: "node-b".into(),
        },
        DiskInfo {
            id: "d7".into(),
            serial: "KINGSTON-DC500".into(),
            size: "960GB".into(),
            status: "available".into(),
            node_id: "node-b".into(),
        },
        DiskInfo {
            id: "d8".into(),
            serial: "KINGSTON-DC500".into(),
            size: "960GB".into(),
            status: "available".into(),
            node_id: "node-b".into(),
        },
    ])
}

async fn enforce_quotas_on_all_pools() -> anyhow::Result<()> {
    info!("Enforcing 90% hard quotas on all ZFS pools...");
    let pools = ZpoolService::list_pools().await?;
    for pool in pools {
        if let Ok(quota) = ZpoolService::calculate_90_percent(&pool.size) {
            info!("Applying {} quota to pool {}", quota, pool.name);
            ZpoolService::apply_quota(&pool.name, &quota).await?;
        }
    }
    Ok(())
}

#[derive(Deserialize, utoipa::IntoParams)]
struct ListDatasetsQuery {
    pool: String,
}

#[derive(Deserialize, utoipa::ToSchema)]
struct DeleteDatasetPayload {
    pool: String,
    name: String,
}

/// Query parameters for config history endpoint
///
/// @ref Story-3.2 - Server-side filtering and pagination for git history
#[derive(Deserialize, utoipa::IntoParams)]
struct ConfigHistoryQuery {
    /// Maximum number of commits to return (default: 50, max: 200)
    #[serde(default = "default_limit")]
    limit: u32,
    /// Number of commits to skip for pagination
    #[serde(default)]
    offset: u32,
    /// Filter commits by author name
    #[serde(default)]
    author_filter: Option<String>,
    /// Filter commits from this date (ISO 8601)
    #[serde(default)]
    date_from: Option<String>,
    /// Filter commits until this date (ISO 8601)
    #[serde(default)]
    date_to: Option<String>,
}

fn default_limit() -> u32 {
    50
}

#[utoipa::path(get, path = "/api/v1/storage/datasets", params(ListDatasetsQuery), responses((status = 200, description = "List datasets for a pool", body = Vec<DatasetInfo>)))]
async fn list_datasets(
    axum::extract::Query(params): axum::extract::Query<ListDatasetsQuery>,
) -> Json<Vec<DatasetInfo>> {
    let datasets = ZpoolService::list_datasets(&params.pool).await.unwrap();
    Json(datasets)
}

#[utoipa::path(post, path = "/api/v1/storage/datasets", request_body = DatasetConfig, responses((status = 200, description = "Dataset created", body = DatasetInfo)))]
async fn create_dataset(
    user: AuthenticatedUser,
    Json(payload): Json<DatasetConfig>,
) -> Result<Json<DatasetInfo>, (StatusCode, String)> {
    match ZpoolService::create_dataset(payload.clone()).await {
        Ok(ds) => {
            if let Err(e) = ConfigDb::save_and_commit(
                &format!("dataset_{}.json", ds.name),
                &payload,
                &user.username,
                "create",
                &format!("dataset {}", ds.name),
            ) {
                warn!("Failed to persist dataset configuration: {}", e);
            }
            Ok(Json(ds))
        }
        Err(e) => {
            let msg = e.to_string();
            if msg.contains("exists") {
                Err((StatusCode::CONFLICT, msg))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, msg))
            }
        }
    }
}

#[utoipa::path(post, path = "/api/v1/storage/datasets/delete", request_body = DeleteDatasetPayload, responses((status = 200, description = "Dataset destroyed", body = String)))]
async fn destroy_dataset(
    user: AuthenticatedUser,
    Json(payload): Json<DeleteDatasetPayload>,
) -> Json<String> {
    ZpoolService::destroy_dataset(&payload.pool, &payload.name)
        .await
        .unwrap();
    if let Err(e) = ConfigDb::delete_and_commit(
        &format!("dataset_{}.json", payload.name),
        &user.username,
        "delete",
        &format!("dataset {}/{}", payload.pool, payload.name),
    ) {
        warn!("Failed to delete dataset configuration: {}", e);
    }
    Json("Dataset destroyed".to_string())
}

/// Get configuration history with pagination and filtering
///
/// @ref Story-3.2 - Fetch paginated list of configuration commits
#[utoipa::path(
    get,
    path = "/api/v1/config/history",
    params(ConfigHistoryQuery),
    responses(
        (status = 200, description = "Configuration commit history", body = Vec<GitCommit>),
        (status = 503, description = "Configuration repository not yet created")
    )
)]
async fn get_config_history(
    axum::extract::Query(params): axum::extract::Query<ConfigHistoryQuery>,
) -> Result<Json<Vec<GitCommit>>, (StatusCode, String)> {
    match GitHistoryService::read_commit_log(
        ganache_lib::git::DEFAULT_REPO_PATH,
        params.limit,
        params.offset,
        params.author_filter.as_deref(),
        params.date_from.as_deref(),
        params.date_to.as_deref(),
    ) {
        Ok(commits) => Ok(Json(commits)),
        Err(e) => {
            let msg = e.to_string();
            if msg.contains("Configuration repository not yet created") {
                Err((StatusCode::SERVICE_UNAVAILABLE, msg))
            } else if msg.contains("corrupted") {
                Err((StatusCode::INTERNAL_SERVER_ERROR, msg))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, msg))
            }
        }
    }
}

/// Get diff for a specific commit
///
/// @ref Story-3.2 - Visual comparison of configuration changes
#[utoipa::path(
    get,
    path = "/api/v1/config/history/{commit_id}/diff",
    params(
        ("commit_id" = String, Path, description = "Commit hash ID")
    ),
    responses(
        (status = 200, description = "Commit diff with file changes", body = GitDiff),
        (status = 404, description = "Commit not found"),
        (status = 503, description = "Configuration repository not yet created")
    )
)]
async fn get_commit_diff(
    axum::extract::Path(commit_id): axum::extract::Path<String>,
) -> Result<Json<GitDiff>, (StatusCode, String)> {
    match GitHistoryService::get_commit_diff(ganache_lib::git::DEFAULT_REPO_PATH, &commit_id) {
        Ok(diff) => Ok(Json(diff)),
        Err(e) => {
            let msg = e.to_string();
            if msg.contains("Configuration repository not yet created") {
                Err((StatusCode::SERVICE_UNAVAILABLE, msg))
            } else if msg.contains("Failed to get diff") {
                Err((
                    StatusCode::NOT_FOUND,
                    format!("Commit {} not found", commit_id),
                ))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, msg))
            }
        }
    }
}

/// Rollback configuration to a specific commit
///
/// # Purpose
/// One-click rollback of configuration to a previous state with audit trail
///
/// @ref Story-3.3 - Implements rollback endpoint for configuration time-machine
#[utoipa::path(
    post,
    path = "/api/v1/config/rollback",
    request_body = RollbackRequest,
    responses(
        (status = 200, description = "Configuration rolled back successfully", body = RollbackResponse),
        (status = 400, description = "Invalid commit ID or request"),
        (status = 503, description = "Configuration repository not yet created")
    )
)]
async fn rollback_config(
    user: AuthenticatedUser,
    Json(payload): Json<RollbackRequest>,
) -> Result<Json<RollbackResponse>, (StatusCode, String)> {
    // Validate reason field
    let reason = payload.reason.trim();
    if reason.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "Rollback reason is required and cannot be empty".to_string(),
        ));
    }
    if reason.len() > 1000 {
        return Err((
            StatusCode::BAD_REQUEST,
            "Rollback reason is too long (max 1000 characters)".to_string(),
        ));
    }

    match ganache_lib::GitService::rollback_config(&payload.commit_id, &user.username, reason) {
        Ok(rollback_commit_id) => {
            let message = format!(
                "Configuration rolled back to commit {} by {}. Rollback commit: {}",
                &payload.commit_id[..7.min(payload.commit_id.len())],
                user.username,
                &rollback_commit_id[..7.min(rollback_commit_id.len())]
            );

            Ok(Json(RollbackResponse {
                success: true,
                rollback_commit_id,
                message,
            }))
        }
        Err(e) => {
            let msg = e.to_string();
            if msg.contains("Invalid commit ID") {
                Err((StatusCode::BAD_REQUEST, msg))
            } else if msg.contains("not exist") || msg.contains("not found") {
                Err((
                    StatusCode::SERVICE_UNAVAILABLE,
                    "Configuration repository not yet created".to_string(),
                ))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, msg))
            }
        }
    }
}

/// Join Active Directory domain
///
/// # Purpose
/// Joins the Ganache appliance to an Active Directory domain using the provided credentials
///
/// # Arguments
/// * `user` - Authenticated user making the request (extracted from X-Auth-User header)
/// * `payload` - AD join request containing domain name, credentials, and DNS settings
///
/// # Returns
/// JSON response with join status or error message
///
/// @ref Story-4.1 - API endpoint for AD domain join
#[utoipa::path(
    post,
    path = "/api/v1/ad/join",
    request_body = AdJoinRequest,
    responses(
        (status = 200, description = "Successfully joined domain", body = AdJoinResponse),
        (status = 400, description = "Invalid request parameters"),
        (status = 500, description = "Failed to join domain")
    )
)]
async fn join_ad_domain(
    user: AuthenticatedUser,
    Json(payload): Json<AdJoinRequest>,
) -> Result<Json<AdJoinResponse>, (StatusCode, String)> {
    info!(
        "AD join request for domain: {} by user: {}",
        payload.domain_name, user.username
    );

    match AdService::join_domain(&payload) {
        Ok(response) => {
            // Persist AD configuration to Git
            if let Err(e) = ConfigDb::save_and_commit(
                "ad_config.json",
                &payload,
                &user.username,
                "join",
                &format!("Active Directory domain {}", payload.domain_name),
            ) {
                warn!("Failed to persist AD configuration: {}", e);
            }

            info!("Successfully joined domain: {}", payload.domain_name);
            Ok(Json(response))
        }
        Err(e) => {
            warn!("Failed to join AD domain: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
        }
    }
}

/// Get Active Directory status
///
/// # Purpose
/// Returns current AD join status including domain name and service state
///
/// @ref Story-4.1 - Query AD join status
#[utoipa::path(
    get,
    path = "/api/v1/ad/status",
    responses(
        (status = 200, description = "AD status retrieved successfully", body = AdStatus)
    )
)]
async fn get_ad_status() -> Json<AdStatus> {
    let status = AdService::get_status().unwrap_or(AdStatus {
        is_joined: false,
        domain_name: None,
        last_sync: None,
        service_status: "inactive".to_string(),
    });
    Json(status)
}

/// Leave Active Directory domain
///
/// # Purpose
/// Removes the Ganache appliance from the current AD domain
///
/// # Arguments
/// * `user` - Authenticated user making the request
///
/// @ref Story-4.1 - Leave AD domain functionality
#[utoipa::path(
    post,
    path = "/api/v1/ad/leave",
    responses(
        (status = 200, description = "Successfully left domain", body = AdJoinResponse),
        (status = 500, description = "Failed to leave domain")
    )
)]
async fn leave_ad_domain(
    user: AuthenticatedUser,
) -> Result<Json<AdJoinResponse>, (StatusCode, String)> {
    info!("AD leave request by user: {}", user.username);

    match AdService::leave_domain() {
        Ok(response) => {
            // Remove AD configuration from Git
            if let Err(e) = ConfigDb::delete_and_commit(
                "ad_config.json",
                &user.username,
                "leave",
                "Active Directory domain",
            ) {
                warn!("Failed to delete AD configuration: {}", e);
            }

            info!("Successfully left AD domain");
            Ok(Json(response))
        }
        Err(e) => {
            warn!("Failed to leave AD domain: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
        }
    }
}
