use axum::{
    routing::get,
    Router,
    Json,
};
use std::net::SocketAddr;
use ganache_lib::HardwareService;
use ganache_api::HardwareInfo;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    #[derive(OpenApi)]
    #[openapi(
        paths(get_hardware_info),
        components(schemas(ganache_api::HardwareInfo))
    )]
    struct ApiDoc;

    // Build app
    let app = Router::new()
        .route("/api/v1/system/hardware", get(get_hardware_info))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()));

    // Run app
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/// Handler for Hardware Detection
#[utoipa::path(
    get,
    path = "/api/v1/system/hardware",
    responses(
        (status = 200, description = "Hardware Info successfully retrieved", body = HardwareInfo)
    )
)]
async fn get_hardware_info() -> Json<HardwareInfo> {
    // Call the library function
    // In real app, handle error. Here we unwrap for minimal MVP.
    let info = HardwareService::detect_raid_controller().unwrap();
    Json(info)
}
