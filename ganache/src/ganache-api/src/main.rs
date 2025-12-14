//! Ganache API Server
//!
//! Main HTTP server for Ganache Enterprise NAS
//! Based on Proxmox Backup Server architecture

use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use std::env;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod handlers;
mod routes;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ganache_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()?;

    tracing::info!("🚀 Starting Ganache API Server on port {}", port);

    HttpServer::new(|| {
        App::new()
            // Enable CORS for development
            .wrap(Cors::permissive())
            // Configure JSON extractor
            .app_data(web::JsonConfig::default().limit(10 * 1024 * 1024)) // 10MB
            // Register routes
            .service(
                web::scope("/api2/json")
                    .service(routes::smb_routes())
                    .service(routes::system_routes())
                    .service(routes::zfs_routes()),
            )
            // Health check endpoint
            .route("/health", web::get().to(health_check))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await?;

    Ok(())
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "ganache-api",
        "version": "0.1.0"
    }))
}
