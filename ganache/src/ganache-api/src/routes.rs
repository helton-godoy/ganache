//! Routes module for Ganache API
//!
//! Defines all HTTP endpoints for the API

use super::handlers::*;
use actix_web::{web, Scope};

/// Configure SMB-related routes
pub fn smb_routes() -> Scope {
    web::scope("/smb")
        .route("/list", web::get().to(list_smb_shares))
        .route("/create", web::post().to(create_smb_share))
        .route("/delete/{id}", web::delete().to(delete_smb_share))
}

/// Configure system-related routes
pub fn system_routes() -> Scope {
    web::scope("/system")
        .route("/status", web::get().to(system_status))
        .route("/info", web::get().to(system_info))
}

/// Configure ZFS-related routes
pub fn zfs_routes() -> Scope {
    web::scope("/zfs")
        .route("/pools", web::get().to(list_zfs_pools))
        .route("/datasets", web::get().to(list_zfs_datasets))
        .route("/snapshot", web::post().to(create_zfs_snapshot))
}
