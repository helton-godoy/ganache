//! Integration tests for ACL Service
//!
//! @ref Story-4.2 - ACL service integration tests

use ganache_api::models::active_directory::{AdPrincipalType, AdSearchRequest};
use ganache_lib::AclService;

#[test]
fn test_search_principals_in_dev_mode() {
    // Set dev mode
    std::env::set_var("GANACHE_DEV_MODE", "true");

    let request = AdSearchRequest {
        query: Some("Finance".to_string()),
        principal_type: Some(AdPrincipalType::Group),
        page: 0,
        page_size: 50,
    };

    let result = AclService::search_principals(&request);
    assert!(result.is_ok(), "Search should succeed in dev mode");

    let response = result.unwrap();
    assert!(
        !response.principals.is_empty(),
        "Should return mock principals"
    );
    assert_eq!(response.principals[0].name, "Finance-Group");
    assert_eq!(response.page, 0);
    assert_eq!(response.page_size, 50);
}

#[test]
fn test_search_principals_pagination() {
    std::env::set_var("GANACHE_DEV_MODE", "true");

    let request = AdSearchRequest {
        query: None,
        principal_type: None,
        page: 0,
        page_size: 2, // Small page size to test pagination
    };

    let result = AclService::search_principals(&request);
    assert!(result.is_ok());

    let response = result.unwrap();
    assert_eq!(
        response.principals.len(),
        2,
        "Should return exactly 2 principals"
    );
    assert!(response.has_more, "Should indicate more pages available");
}

#[test]
fn test_get_acl_in_dev_mode() {
    std::env::set_var("GANACHE_DEV_MODE", "true");

    let result = AclService::get_acl("/test/path", "compact");
    assert!(result.is_ok(), "Get ACL should succeed in dev mode");

    let response = result.unwrap();
    assert_eq!(response.acl.path, "/test/path");
    assert!(!response.acl.aces.is_empty(), "Should have ACEs");
    assert!(response.raw_output.is_some(), "Should have raw output");
}

#[test]
fn test_set_acl_in_dev_mode() {
    std::env::set_var("GANACHE_DEV_MODE", "true");

    // Create a valid ACL
    let acl = ganache_api::models::acl::Nfs4Acl {
        path: "/test/path".to_string(),
        aces: vec![ganache_api::models::acl::Nfs4Ace {
            index: Some(0),
            principal: ganache_api::models::acl::AcePrincipal::Owner,
            permissions: ganache_api::models::acl::Nfs4Permissions {
                read_data: true,
                write_data: true,
                execute: true,
                ..Default::default()
            },
            inherit_flags: Default::default(),
            ace_type: ganache_api::models::acl::AceType::Allow,
        }],
    };

    let result = AclService::set_acl("/test/path", &acl);
    assert!(result.is_ok(), "Set ACL should succeed in dev mode");

    let response = result.unwrap();
    assert!(response.success);
    assert!(response.message.contains("DEV MODE"));
}

#[test]
fn test_acl_validation_requires_owner() {
    std::env::set_var("GANACHE_DEV_MODE", "true");

    // ACL without owner@ should fail validation
    let acl = ganache_api::models::acl::Nfs4Acl {
        path: "/test/path".to_string(),
        aces: vec![ganache_api::models::acl::Nfs4Ace {
            index: Some(0),
            principal: ganache_api::models::acl::AcePrincipal::Everyone,
            permissions: Default::default(),
            inherit_flags: Default::default(),
            ace_type: ganache_api::models::acl::AceType::Allow,
        }],
    };

    let result = AclService::set_acl("/test/path", &acl);
    assert!(result.is_err(), "Should fail validation without owner@");
    assert!(result.unwrap_err().to_string().contains("owner@ entry"));
}

#[test]
fn test_acl_validation_rejects_empty() {
    std::env::set_var("GANACHE_DEV_MODE", "true");

    let acl = ganache_api::models::acl::Nfs4Acl {
        path: "/test/path".to_string(),
        aces: vec![],
    };

    let result = AclService::set_acl("/test/path", &acl);
    assert!(result.is_err(), "Should fail validation with empty ACL");
    assert!(result.unwrap_err().to_string().contains("at least one ACE"));
}

#[test]
fn test_search_by_principal_type_user() {
    std::env::set_var("GANACHE_DEV_MODE", "true");

    let request = AdSearchRequest {
        query: None,
        principal_type: Some(AdPrincipalType::User),
        page: 0,
        page_size: 50,
    };

    let result = AclService::search_principals(&request);
    assert!(result.is_ok());

    let response = result.unwrap();
    // All returned principals should be users
    for principal in response.principals {
        assert_eq!(principal.principal_type, AdPrincipalType::User);
    }
}
