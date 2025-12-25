# API Section: undefined

## GET /api/v1/acl/principals

**Summary**: Search Active Directory for users and groups

@ref Story-4.2 - Searchable AD principal listing endpoint

**Operation ID**: `search_ad_principals`

### Example Usage (TypeScript SDK)

```typescript
import { useSearch_ad_principals } from '@/api/generated';

const { mutate, data } = useSearch_ad_principals();
// Call mutate(...) or use data
```

---

## GET /api/v1/acl/{path}

**Summary**: Get ACL for a filesystem path

@ref Story-4.2 - ACL retrieval endpoint

**Operation ID**: `get_acl`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_acl } from '@/api/generated';

const { mutate, data } = useGet_acl();
// Call mutate(...) or use data
```

---

## POST /api/v1/acl/{path}

**Summary**: Set ACL for a filesystem path

@ref Story-4.2 - ACL modification endpoint
@ref Story-4.3 - Added recursive support

**Operation ID**: `set_acl`

### Example Usage (TypeScript SDK)

```typescript
import { useSet_acl } from '@/api/generated';

const { mutate, data } = useSet_acl();
// Call mutate(...) or use data
```

---

## POST /api/v1/ad/join

**Summary**: Join Active Directory domain

# Purpose
Joins the Ganache appliance to an Active Directory domain using the provided credentials

# Arguments
* `user` - Authenticated user making the request (extracted from X-Auth-User header)
* `payload` - AD join request containing domain name, credentials, and DNS settings

# Returns
JSON response with join status or error message

@ref Story-4.1 - API endpoint for AD domain join

**Operation ID**: `join_ad_domain`

### Example Usage (TypeScript SDK)

```typescript
import { useJoin_ad_domain } from '@/api/generated';

const { mutate, data } = useJoin_ad_domain();
// Call mutate(...) or use data
```

---

## POST /api/v1/ad/leave

**Summary**: Leave Active Directory domain

# Purpose
Removes the Ganache appliance from the current AD domain

# Arguments
* `user` - Authenticated user making the request

@ref Story-4.1 - Leave AD domain functionality

**Operation ID**: `leave_ad_domain`

### Example Usage (TypeScript SDK)

```typescript
import { useLeave_ad_domain } from '@/api/generated';

const { mutate, data } = useLeave_ad_domain();
// Call mutate(...) or use data
```

---

## GET /api/v1/ad/status

**Summary**: Get Active Directory status

# Purpose
Returns current AD join status including domain name and service state

@ref Story-4.1 - Query AD join status

**Operation ID**: `get_ad_status`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_ad_status } from '@/api/generated';

const { mutate, data } = useGet_ad_status();
// Call mutate(...) or use data
```

---

## POST /api/v1/cluster/configure

**Summary**: No summary

**Operation ID**: `configure_cluster`

### Example Usage (TypeScript SDK)

```typescript
import { useConfigure_cluster } from '@/api/generated';

const { mutate, data } = useConfigure_cluster();
// Call mutate(...) or use data
```

---

## POST /api/v1/cluster/heartbeat

**Summary**: No summary

**Operation ID**: `heartbeat`

### Example Usage (TypeScript SDK)

```typescript
import { useHeartbeat } from '@/api/generated';

const { mutate, data } = useHeartbeat();
// Call mutate(...) or use data
```

---

## POST /api/v1/cluster/simulate-failure

**Summary**: No summary

**Operation ID**: `simulate_failure`

### Example Usage (TypeScript SDK)

```typescript
import { useSimulate_failure } from '@/api/generated';

const { mutate, data } = useSimulate_failure();
// Call mutate(...) or use data
```

---

## GET /api/v1/cluster/status

**Summary**: No summary

**Operation ID**: `get_cluster_status`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_cluster_status } from '@/api/generated';

const { mutate, data } = useGet_cluster_status();
// Call mutate(...) or use data
```

---

## GET /api/v1/config/history

**Summary**: Get configuration history with pagination and filtering

@ref Story-3.2 - Fetch paginated list of configuration commits

**Operation ID**: `get_config_history`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_config_history } from '@/api/generated';

const { mutate, data } = useGet_config_history();
// Call mutate(...) or use data
```

---

## GET /api/v1/config/history/{commit_id}/diff

**Summary**: Get diff for a specific commit

@ref Story-3.2 - Visual comparison of configuration changes

**Operation ID**: `get_commit_diff`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_commit_diff } from '@/api/generated';

const { mutate, data } = useGet_commit_diff();
// Call mutate(...) or use data
```

---

## POST /api/v1/config/rollback

**Summary**: Rollback configuration to a specific commit

# Purpose
One-click rollback of configuration to a previous state with audit trail

@ref Story-3.3 - Implements rollback endpoint for configuration time-machine

**Operation ID**: `rollback_config`

### Example Usage (TypeScript SDK)

```typescript
import { useRollback_config } from '@/api/generated';

const { mutate, data } = useRollback_config();
// Call mutate(...) or use data
```

---

## GET /api/v1/security/alerts

**Summary**: Get active security alerts

# Purpose
Returns list of active security alerts generated by the system

@ref Story-5.4 - Security alerts endpoint

**Operation ID**: `get_security_alerts`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_security_alerts } from '@/api/generated';

const { mutate, data } = useGet_security_alerts();
// Call mutate(...) or use data
```

---

## GET /api/v1/security/events

**Summary**: Get security events with filtering and pagination

# Purpose
Returns security events from the in-memory cache with optional filters

@ref Story-5.4 - Security events endpoint

**Operation ID**: `get_security_events`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_security_events } from '@/api/generated';

const { mutate, data } = useGet_security_events();
// Call mutate(...) or use data
```

---

## GET /api/v1/security/metrics

**Summary**: Get aggregated security metrics

# Purpose
Returns real-time security metrics including events/min, active users, suspicious IPs

@ref Story-5.4 - Security metrics endpoint

**Operation ID**: `get_security_metrics`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_security_metrics } from '@/api/generated';

const { mutate, data } = useGet_security_metrics();
// Call mutate(...) or use data
```

---

## POST /api/v1/storage/create-pool

**Summary**: No summary

**Operation ID**: `create_pool`

### Example Usage (TypeScript SDK)

```typescript
import { useCreate_pool } from '@/api/generated';

const { mutate, data } = useCreate_pool();
// Call mutate(...) or use data
```

---

## GET /api/v1/storage/datasets

**Summary**: No summary

**Operation ID**: `list_datasets`

### Example Usage (TypeScript SDK)

```typescript
import { useList_datasets } from '@/api/generated';

const { mutate, data } = useList_datasets();
// Call mutate(...) or use data
```

---

## POST /api/v1/storage/datasets

**Summary**: No summary

**Operation ID**: `create_dataset`

### Example Usage (TypeScript SDK)

```typescript
import { useCreate_dataset } from '@/api/generated';

const { mutate, data } = useCreate_dataset();
// Call mutate(...) or use data
```

---

## POST /api/v1/storage/datasets/delete

**Summary**: No summary

**Operation ID**: `destroy_dataset`

### Example Usage (TypeScript SDK)

```typescript
import { useDestroy_dataset } from '@/api/generated';

const { mutate, data } = useDestroy_dataset();
// Call mutate(...) or use data
```

---

## GET /api/v1/storage/disks

**Summary**: No summary

**Operation ID**: `list_disks`

### Example Usage (TypeScript SDK)

```typescript
import { useList_disks } from '@/api/generated';

const { mutate, data } = useList_disks();
// Call mutate(...) or use data
```

---

## GET /api/v1/storage/drbd-devices

**Summary**: No summary

**Operation ID**: `get_drbd_devices`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_drbd_devices } from '@/api/generated';

const { mutate, data } = useGet_drbd_devices();
// Call mutate(...) or use data
```

---

## GET /api/v1/storage/pools

**Summary**: No summary

**Operation ID**: `get_pools`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_pools } from '@/api/generated';

const { mutate, data } = useGet_pools();
// Call mutate(...) or use data
```

---

## GET /api/v1/system/boot-environments

**Summary**: No summary

**Operation ID**: `get_boot_environments`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_boot_environments } from '@/api/generated';

const { mutate, data } = useGet_boot_environments();
// Call mutate(...) or use data
```

---

## POST /api/v1/system/boot-environments/activate

**Summary**: No summary

**Operation ID**: `activate_boot_environment`

### Example Usage (TypeScript SDK)

```typescript
import { useActivate_boot_environment } from '@/api/generated';

const { mutate, data } = useActivate_boot_environment();
// Call mutate(...) or use data
```

---

## GET /api/v1/system/hardware

**Summary**: No summary

**Operation ID**: `get_hardware_info`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_hardware_info } from '@/api/generated';

const { mutate, data } = useGet_hardware_info();
// Call mutate(...) or use data
```

---

## GET /api/v1/system/logs

**Summary**: No summary

**Operation ID**: `get_system_logs`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_system_logs } from '@/api/generated';

const { mutate, data } = useGet_system_logs();
// Call mutate(...) or use data
```

---

## POST /api/v1/system/promote

**Summary**: No summary

**Operation ID**: `promote_node`

### Example Usage (TypeScript SDK)

```typescript
import { usePromote_node } from '@/api/generated';

const { mutate, data } = usePromote_node();
// Call mutate(...) or use data
```

---

## GET /api/v1/system/resources

**Summary**: No summary

**Operation ID**: `get_system_resources`

### Example Usage (TypeScript SDK)

```typescript
import { useGet_system_resources } from '@/api/generated';

const { mutate, data } = useGet_system_resources();
// Call mutate(...) or use data
```

---

