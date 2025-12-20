# Code Review: Story 2.5 - Automated Failover Panic Logic

**Date:** 2025-12-19
**Reviewer:** Amelia (Dev Agent - Adversarial Mode)
**Status:** 🔴 **FAIL**

## Summary

The implementation provides the skeletal logic for failover but fails to validate the core business requirements due to excessive mocking in the verification layer. The backend contains brittle hardcoded values that compromise the robustness required for an "Appliance" grade feature.

## Critical Findings (Blocking)

### 1. E2E Tests Validate Mocks, Not Logic

**Location:** `tests/e2e/failover.spec.ts`
**Severity:** CRITICAL
**Issue:** The Playwright test intercepts `/api/v1/cluster/status` and provides a canned response to simulate failover.
**Impact:** The actual backend `promote_peer` logic (DRBD promotion, ZFS import, VIP takeover) is **NEVER EXECUTED** during the test.
**Acceptance Criteria Violation:** "Validate <30s downtime requirement" and "Test DRBD promotion and ZFS import sequence" are **NOT** met. You verified a JSON object, not a Failover.

## Major Findings (Required Fixes)

### 2. Hardcoded Network Configuration

**Location:** `core/ganache-lib/src/system/cluster.rs`
**Severity:** HIGH
**Issue:**

```rust
Command::new("ip").args(&["addr", "add", "192.168.1.100/24", "dev", "eth0"])
```

**Impact:**

- The failover will **fail** on any machine where the interface is not `eth0`.
- The VIP `192.168.1.100` is arbitrary and will cause IP conflicts or routing issues on user networks.
**Recommendation:** These values must be configurable via `ClusterConfig` or at least derived from the system state.

### 3. Hardcoded DRBD Resource

**Location:** `core/ganache-lib/src/system/cluster.rs`
**Severity:** MEDIUM
**Issue:** Hardcoded `r0` resource name.
**Impact:** Prevents handling multiple resources or custom configurations.

## Verification Log

- [x] Reviewed `2-5-automated-failover-panic-logic.md` (AC & Tasks)
- [x] Reviewed `core/ganache-lib/src/system/cluster.rs` (Backend Logic)
- [x] Reviewed `core/ganache-lib/src/system/zfs.rs` (ZFS Logic)
- [x] Reviewed `tests/e2e/failover.spec.ts` (Validation)
- [x] Checked Git Status

## Recommendation

**REJECT** the story.

1. **Refactor** `cluster.rs` to accept VIP and Interface as config parameters.
2. **Rewrite** the E2E strategy. If CI cannot support real root-level network commands:
   - Create an Integration Test in Rust that mocks the *Syscalls* (Command execution) but verifies the *Sequence* and *Timing* logic.
   - OR, mark E2E as "Manual Verification Required" and provide a script.
   - **Do not** claim automated verification of downtime with a React mock.
