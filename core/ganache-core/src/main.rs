use axum::{routing::get, Json, Router};
use ganache_api::{
    BootEnvironment, BootEnvironmentActivation, ClusterConfig, ClusterStatus, DatasetConfig,
    DatasetInfo, HardwareInfo, PoolConfig, PoolInfo, StorageDevice, SystemResources,
};
use ganache_lib::{BootService, ClusterService, HardwareService, MemoryService, ZpoolService};
use serde::{Deserialize, Serialize};
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

    #[derive(OpenApi)]
    #[openapi(
        paths(
            get_hardware_info,
            configure_cluster,
            get_cluster_status,
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
            destroy_dataset
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
            SystemLog,
            DiskInfo
        ))
    )]
    struct ApiDoc;

    let args: Vec<String> = env::args().collect();
    if args.len() > 1 && args[1] == "--export-openapi" {
        let json = ApiDoc::openapi().to_pretty_json().unwrap();
        let path = "../docs/openapi.json";
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

    let app = Router::new()
        .route("/api/v1/system/hardware", get(get_hardware_info))
        .route("/api/v1/system/resources", get(get_system_resources))
        .route(
            "/api/v1/cluster/configure",
            axum::routing::post(configure_cluster),
        )
        .route("/api/v1/cluster/status", get(get_cluster_status))
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
async fn configure_cluster(Json(payload): Json<ClusterConfig>) -> Json<ClusterStatus> {
    let status = ClusterService::configure_node(payload).await.unwrap();
    Json(status)
}

#[utoipa::path(get, path = "/api/v1/cluster/status", responses((status = 200, description = "Cluster Status successfully retrieved", body = ClusterStatus)))]
async fn get_cluster_status() -> Json<ClusterStatus> {
    let status = ClusterService::get_status().await.unwrap();
    Json(status)
}

#[utoipa::path(get, path = "/api/v1/system/boot-environments", responses((status = 200, description = "List of Boot Environments", body = Vec<BootEnvironment>)))]
async fn get_boot_environments() -> Json<Vec<ganache_api::BootEnvironment>> {
    let list = BootService::list_boot_environments().unwrap();
    Json(list)
}

#[utoipa::path(post, path = "/api/v1/system/boot-environments/activate", request_body = BootEnvironmentActivation, responses((status = 200, description = "Boot Environment Activated", body = String)))]
async fn activate_boot_environment(Json(payload): Json<BootEnvironmentActivation>) -> Json<String> {
    let result = BootService::activate_boot_environment(&payload.name).unwrap();
    Json(result)
}

#[utoipa::path(get, path = "/api/v1/storage/drbd-devices", responses((status = 200, description = "List of available DRBD devices", body = Vec<StorageDevice>)))]
async fn get_drbd_devices() -> Json<Vec<ganache_api::StorageDevice>> {
    let devices = ZpoolService::get_drbd_devices().await.unwrap();
    Json(devices)
}

#[utoipa::path(post, path = "/api/v1/storage/create-pool", request_body = PoolConfig, responses((status = 200, description = "Pool Created", body = PoolInfo)))]
async fn create_pool(Json(payload): Json<ganache_api::PoolConfig>) -> Json<ganache_api::PoolInfo> {
    let pool = ZpoolService::create_pool(payload).await.unwrap();
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
async fn promote_node() -> Json<String> {
    Json("Node promoted successfully (Stub)".to_string())
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

#[utoipa::path(get, path = "/api/v1/storage/datasets", params(ListDatasetsQuery), responses((status = 200, description = "List datasets for a pool", body = Vec<DatasetInfo>)))]
async fn list_datasets(
    axum::extract::Query(params): axum::extract::Query<ListDatasetsQuery>,
) -> Json<Vec<DatasetInfo>> {
    let datasets = ZpoolService::list_datasets(&params.pool).await.unwrap();
    Json(datasets)
}

#[utoipa::path(post, path = "/api/v1/storage/datasets", request_body = DatasetConfig, responses((status = 200, description = "Dataset created", body = DatasetInfo)))]
async fn create_dataset(Json(payload): Json<DatasetConfig>) -> Json<DatasetInfo> {
    let ds = ZpoolService::create_dataset(payload).await.unwrap();
    Json(ds)
}

#[utoipa::path(post, path = "/api/v1/storage/datasets/delete", request_body = DeleteDatasetPayload, responses((status = 200, description = "Dataset destroyed", body = String)))]
async fn destroy_dataset(Json(payload): Json<DeleteDatasetPayload>) -> Json<String> {
    ZpoolService::destroy_dataset(&payload.pool, &payload.name)
        .await
        .unwrap();
    Json("Dataset destroyed".to_string())
}
