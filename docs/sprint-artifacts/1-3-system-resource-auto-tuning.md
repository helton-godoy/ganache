# Story 1.3: System Resource Auto-Tuning

Status: done

## Story

As a **System Administrator**,
I want **the system to automatically tune ZFS ARC limits based on my installed RAM**,
so that **the system remains stable without manual memory tuning**.

## Acceptance Criteria

1. **Given** the system boot process
2. **When** RAM is detected
3. **Then** set ZFS ARC Max to 50% of Total RAM if < 32GB
4. **And** set ZFS ARC Max to 2GB less than Total RAM if > 32GB
5. **And** ensure at least 4GB is reserved for the OS/Middleware

## Tasks / Subtasks

- [x] **Backend: Resource Service (Rust)**
  - [x] Create `ResourceService` in `ganache-lib`.
  - [x] Implement `get_system_memory` (using `sysinfo` crate or reading `/proc/meminfo`).
  - [x] Implement `calculate_arc_max(total_ram)` logic based on ACs.
  - [x] Implement `apply_arc_tuning` (Mocked for dev/container, real implementation via `/etc/modprobe.d` or `/sys` writer safely).

- [x] **Backend: API Exposure**
  - [x] Expose `GET /api/v1/system/resources` returning Total RAM, Used RAM, and Current ARC Target.
  - [x] Trigger tuning on startup in `main.rs`.

- [ ] **Frontend: Dashboard Integration (Optional/Bonus)**
  - [ ] Display "System Memory" card showing "ARC Target" vs "Total RAM".

- [x] **Testing**
  - [x] Unit Test `calculate_arc_max` with various RAM sizes (16GB, 64GB, 8GB).
  - [x] Verify API returns correct JSON.

## Dev Notes

### Tuning Logic

```rust
fn calculate_arc_max(total_ram_bytes: u64) -> u64 {
    let gib = 1024 * 1024 * 1024;
    // AC: 50% if < 32GB
    if total_ram_bytes < 32 * gib {
        total_ram_bytes / 2
    } else {
        // AC: Total - 2GB if > 32GB
        total_ram_bytes - (2 * gib)
    }
    // AC: Ensure 4GB reserved? (Implicit in the above or needs check?)
    // If Total=8GB, 50%=4GB. Reserved=4GB. OK.
    // If Total=4GB, 50%=2GB. Reserved=2GB. (Might breach "Ensure 4GB reserved" if strictly interpreted as "OS needs 4GB separate".
    // 4GB total - 4GB reserved = 0 for ARC.
    // Let's refine logical check: max(calculated, total - 4GB) might be wrong direction.
    // Logic: ARC = min(calculated, total - 4GB_RESERVED).
}
```

### Mocking vs Real

- Writing to `/sys/module/zfs/parameters/zfs_arc_max` requires root.
- In Docker/Dev, this will likely fail.
- We should detect environment and just Log/Mock if verification fails.
