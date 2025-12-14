//! Handlers module for Ganache API
//!
//! Implements all HTTP request handlers

use actix_web::{web, HttpResponse, Result};
use chrono;
use serde_json::json;

// SMB handlers
pub async fn list_smb_shares() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "data": [
            {
                "id": "share1",
                "name": "Documents",
                "path": "/mnt/data/documents",
                "enabled": true
            }
        ]
    })))
}

pub async fn create_smb_share(payload: web::Json<serde_json::Value>) -> Result<HttpResponse> {
    Ok(HttpResponse::Created().json(json!({
        "data": {
            "id": "new_share",
            "name": payload.get("name").unwrap_or(&json!("Unnamed")),
            "created": true
        }
    })))
}

pub async fn delete_smb_share(path: web::Path<String>) -> Result<HttpResponse> {
    let share_id = path.into_inner();
    Ok(HttpResponse::Ok().json(json!({
        "data": {
            "id": share_id,
            "deleted": true
        }
    })))
}

// System handlers
pub async fn system_status() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "data": {
            "status": "running",
            "uptime": "2 days, 14 hours",
            "cpu_usage": "15%",
            "memory_usage": "45%"
        }
    })))
}

pub async fn system_info() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "data": {
            "hostname": "ganache-server",
            "version": "0.1.0",
            "kernel": "5.15.0",
            "architecture": "x86_64"
        }
    })))
}

// ZFS handlers
pub async fn list_zfs_pools() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "data": [
            {
                "name": "tank",
                "size": "10TB",
                "allocated": "2.5TB",
                "free": "7.5TB",
                "health": "ONLINE"
            }
        ]
    })))
}

pub async fn list_zfs_datasets() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "data": [
            {
                "name": "tank/data",
                "used": "1.2TB",
                "available": "8.8TB",
                "mountpoint": "/mnt/data"
            }
        ]
    })))
}

pub async fn create_zfs_snapshot(payload: web::Json<serde_json::Value>) -> Result<HttpResponse> {
    Ok(HttpResponse::Created().json(json!({
        "data": {
            "dataset": payload.get("dataset").unwrap_or(&json!("tank/data")),
            "snapshot": format!("{}@auto-{}",
                payload.get("dataset").unwrap_or(&json!("tank/data")),
                chrono::Utc::now().format("%Y%m%d_%H%M%S")
            ),
            "created": true
        }
    })))
}
