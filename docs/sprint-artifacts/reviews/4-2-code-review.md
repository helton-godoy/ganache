# Adversarial Code Review: Story 4.2 - ACL Mapper (Rust Core)

## Status: REQUESTED CHANGES

This review has identified several CRITICAL and MEDIUM severity issues that must be addressed before this story can be considered complete. The implementation contains security vulnerabilities, scalability traps, and logic errors.

## 1. CRITICAL: Security - Arbitrary File ACL Modification (Privilege Escalation)

**Location:** `core/ganache-core/src/main.rs`, `set_acl` and `get_acl` handlers.

**Issue:**
The API endpoints accept a raw `path` parameter without any validation that the path resides within a managed ZFS dataset or pool.

- `GET /api/v1/acl/:path` -> `Command::new("nfs4xdr_getfacl").arg(path)`
- `POST /api/v1/acl/:path` -> `Command::new("nfs4xdr_setfacl")...arg(path)`

An attacker (or accidental misuse) can read or modify Access Control Lists for **any file on the system** (e.g., `/etc/shadow`, `/etc/passwd`, `/root/.ssh/authorized_keys`, `/boot/config`). Even if `nfs4xdr` tools are specific to NFSv4 ACLs, invoking them on system files is reckless and could lead to privilege escalation or denial of service (e.g., locking root out of files).

**Recommendation:**
Implement strict path sanitation.

- Require paths to start with `/mnt/` (or the configured storage root).
- Verify the path resolves to a valid Dataset mountpoint or a file within a Dataset.
- Reject paths containing `..`.

## 2. CRITICAL: Performance - Fake LDAP Pagination (Scalability Trap)

**Location:** `core/ganache-lib/src/system/acl_service.rs`, `execute_ldap_search`.

**Issue:**
The implementation claims to allow "searching 100k+ users", but the pagination logic is fundamentally broken for large directories.

- The `ldapsearch` command is invoked with `-E pr={page_size}/noprompt`. This instructs the server to page, but the CLI tool typically **fetches all pages** and dumps them to stdout unless stopped.
- The Rust code reads **the entire output** into a `Vec<AdPrincipal>` in memory (Lines 253-258).
- It then performs "pagination" by slicing this massive vector (`skip(offset).take(page_size)`).

**Consequence:**
To display Page 2 (items 50-100), the system must:

1. Fetch ALL 10,000 users from AD.
2. Parse ALL 10,000 users into memory.
3. Discard 9,950 of them.
   This is `O(N)` per page request. For the cited "100k+ users" scenario, this will cause massive latency and memory pressure, potentially crashing the service.

**Recommendation:**

- If sticking to `ldapsearch` CLI: You must implement a way to request _only_ a specific page (which the CLI might not support easily without state/cookies).
- **Preferred:** Switch to a native Rust LDAP crate (`ldap3`) which supports stateful Paging Search Controls properly, or accept that this is NOT scalable 100k+ users as promised and update the limitations. **At minimum**, remove the deceptive claim that this supports large ADs efficiently.

## 3. MEDIUM: Security - LDAP Injection via Search Query

**Location:** `core/ganache-lib/src/system/acl_service.rs`, `build_ldap_filter`.

**Issue:**
User input `request.query` is inserted directly into the LDAP filter string using `format!`:

```rust
filters.push(format!("(cn=*{}*)", q.trim()));
```

While `trim()` removes whitespace, it does not escape LDAP special characters like `*`, `(`, `)`, `\`, or `NUL`.

- Input `*` becomes `(cn=***)` -> Wildcard expansion.
- Input `admin)(objectClass=*` becomes `(cn=*admin)(objectClass=**)` -> This modifies the filter logic, potentially bypassing type restrictions or exposing hidden objects.

**Recommendation:**
Implement proper LDAP filter escaping. Escape `(`, `)`, `*`, `\`, and `NUL` in the user input before formatting.

## 4. MEDIUM: Security/Stability - ACE Injection via Principal Names

**Location:** `core/ganache-lib/src/system/acl_service.rs`, `acl_to_spec`.

**Issue:**
The system constructs the `nfs4xdr_setfacl` spec string by concatenating strings with colons:

```rust
format!("{}:{}:{}:{}", principal_str, perms_str, flags_str, type_str)
```

If a Principal Name (CN) from AD contains a colon (e.g., `Project: Omega`), the resulting spec string becomes ambiguous or invalid: `user:Project: Omega:rwx...`.

- Maliciously crafted usernames (e.g., `attacker:rwx:f:allow`) could theoretically inject complete ACEs or disrupt parsing.

**Recommendation:**

- Validate that principal names do not contain colons, OR
- Escape colons if the tool supports it, OR
- Quote the principal name if `nfs4xdr_setfacl` supports quoted identifiers.

## 5. MEDIUM: Bug - Excessive ACL Validation

**Location:** `core/ganache-lib/src/system/acl_service.rs`, `validate_acl`.

**Issue:**
Line 450 forbids duplicate `(principal, type)` pairs:

```rust
let key = format!("{:?}:{:?}", ace.principal, ace.ace_type);
if !seen_principals.insert(key.clone()) { ... }
```

This prevents valid NFSv4 ACL configurations where a user needs multiple entries of the same type (e.g., `Allow`) to handle complex inheritance rules (e.g., one entry for file inheritance, one for directory inheritance, or splitting permissions).

**Recommendation:**
Remove this validation check. `nfs4xdr_setfacl` (and ZFS) handles ACE ordering and merging. Enforcing unique principals is a UX simplification that breaks power-user features.

## 6. LOW: Design - Git Repository Bloat and Path Collisions

**Location:** `core/ganache-core/src/main.rs`, `set_acl`.

**Issue:**

1. **Bloat:** Every `set_acl` operation writes a new file `acl_path.json` to the global configuration git repository. For a filesystem with thousands of ACL-managed folders, this will spam the config repo.
2. **Collisions:** `path.replace("/", "_")` is naive. `/mnt/pool/dataset` and `/mnt/pool_dataset` both map to `_mnt_pool_dataset`.

**Recommendation:**

- Only backup ACLs for **Dataset Roots** (matches the granularity of `dataset_*.json`).
- Use a hashing strategy (SHA256 of path) or a subdirectory structure for ACL backups to avoid collisions.

## Summary

The story implementation works for the "Happy Path" in a dev environment but is insecure for the "Enterprise" environment it target. **Do not merge** until Critical issues 1, 2 and Medium issues 3, 4 are resolved.
