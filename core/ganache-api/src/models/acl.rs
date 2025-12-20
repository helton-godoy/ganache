use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Type of Access Control Entry (ACE)
///
/// # Purpose
/// Defines the action type for an ACE (allow, deny, audit)
///
/// @ref Story-4.2 - ACE type enum
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum AceType {
    /// Grant permissions
    Allow,
    /// Deny permissions
    Deny,
    /// Audit successful access (CIFS)
    Audit,
    /// Audit failed access (CIFS)
    Alarm,
}

/// ACE Principal (who receives the permission)
///
/// # Purpose
/// Represents the principal (user/group) that an ACE applies to
///
/// @ref Story-4.2 - ACE principal enum
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum AcePrincipal {
    /// File/directory owner (owner@)
    Owner,
    /// Owning group (group@)
    Group,
    /// Everyone else (everyone@)
    Everyone,
    /// Specific user by name or UID (user:name)
    User(String),
    /// Specific group by name or GID (group:name)
    NamedGroup(String),
}

/// NFSv4 ACL permissions bitflags
///
/// # Purpose
/// Represents the 14 standard NFSv4 permissions as a compact bitmask
///
/// @ref Story-4.2 - NFSv4 permissions spec
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
pub struct Nfs4Permissions {
    /// Read file data or list directory contents (r)
    pub read_data: bool,
    /// Write file data or create files in directory (w)
    pub write_data: bool,
    /// Append to file or create subdirectories (p)
    pub append_data: bool,
    /// Execute file or traverse directory (x)
    pub execute: bool,
    /// Delete file (d)
    pub delete: bool,
    /// Delete child files in directory (D)
    pub delete_child: bool,
    /// Read ACL (c)
    pub read_acl: bool,
    /// Write/modify ACL (C)
    pub write_acl: bool,
    /// Read basic attributes (a)
    pub read_attributes: bool,
    /// Write/modify attributes (A)
    pub write_attributes: bool,
    /// Read extended attributes (R)
    pub read_named_attrs: bool,
    /// Write extended attributes (W)
    pub write_named_attrs: bool,
    /// Change ownership (o)
    pub write_owner: bool,
    /// Synchronize access (s) - placeholder
    pub synchronize: bool,
}

/// ACE inheritance flags
///
/// # Purpose
/// Controls how ACEs are inherited by child files and directories
///
/// @ref Story-4.2 - ACL inheritance spec
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
pub struct AceInheritFlags {
    /// Inherit to files (f)
    pub file_inherit: bool,
    /// Inherit to directories (d)
    pub dir_inherit: bool,
    /// Apply only to future objects, not this directory (i)
    pub inherit_only: bool,
    /// Inherit only to first level (n)
    pub no_propagate: bool,
    /// Audit successful access - CIFS only (S)
    pub successful_access: bool,
    /// Audit failed access - CIFS only (F)
    pub failed_access: bool,
    /// Indicates ACE was inherited (I)
    pub inherited: bool,
}

/// Single Access Control Entry (ACE)
///
/// # Purpose
/// Represents one permission rule in an NFSv4 ACL
///
/// @ref Story-4.2 - NFSv4 ACE implementation
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct Nfs4Ace {
    /// Index in the ACL list (optional, for parsing verbose format)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<u32>,
    /// Principal this ACE applies to
    pub principal: AcePrincipal,
    /// Permissions granted or denied
    pub permissions: Nfs4Permissions,
    /// Inheritance flags
    pub inherit_flags: AceInheritFlags,
    /// Type of ACE (allow/deny/audit)
    pub ace_type: AceType,
}

/// Complete ACL for a file or directory
///
/// # Purpose
/// Represents the full ACL (list of ACEs) for a filesystem object
///
/// @ref Story-4.2 - NFSv4 ACL container
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct Nfs4Acl {
    /// Path to the file/directory
    pub path: String,
    /// Ordered list of ACEs
    pub aces: Vec<Nfs4Ace>,
}

/// Request to get ACL for a path
///
/// # Purpose
/// Query parameters for retrieving ACL in different formats
///
/// @ref Story-4.2 - ACL get request
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct GetAclRequest {
    /// Path to query (relative to dataset root)
    pub path: String,
    /// Return format: "compact" or "verbose" (default: compact)
    #[serde(default = "default_acl_format")]
    pub format: String,
}

fn default_acl_format() -> String {
    "compact".to_string()
}

/// Response containing ACL information
///
/// # Purpose
/// Returns parsed ACL data in structured format
///
/// @ref Story-4.2 - ACL get response
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct GetAclResponse {
    /// Structured ACL data
    pub acl: Nfs4Acl,
    /// Raw output from nfs4xdr_getfacl (for debugging)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw_output: Option<String>,
}

/// Request to set/modify ACL
///
/// # Purpose
/// Applies new ACL to a filesystem path
///
/// @ref Story-4.2 - ACL set request
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SetAclRequest {
    /// Path to modify (relative to dataset root)
    pub path: String,
    /// Complete ACL to apply
    pub acl: Nfs4Acl,
}

/// Response after setting ACL
///
/// # Purpose
/// Confirms ACL modification success
///
/// @ref Story-4.2 - ACL set response
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SetAclResponse {
    /// Success status
    pub success: bool,
    /// Status message
    pub message: String,
}

impl Default for Nfs4Permissions {
    fn default() -> Self {
        Self {
            read_data: false,
            write_data: false,
            append_data: false,
            execute: false,
            delete: false,
            delete_child: false,
            read_acl: false,
            write_acl: false,
            read_attributes: false,
            write_attributes: false,
            read_named_attrs: false,
            write_named_attrs: false,
            write_owner: false,
            synchronize: false,
        }
    }
}

impl Default for AceInheritFlags {
    fn default() -> Self {
        Self {
            file_inherit: false,
            dir_inherit: false,
            inherit_only: false,
            no_propagate: false,
            successful_access: false,
            failed_access: false,
            inherited: false,
        }
    }
}
