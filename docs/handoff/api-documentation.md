# GANACHE - API Documentation

**Generated:** 2025-12-13
**Version:** 1.0.0
**Project:** GANACHE Enterprise NAS
**Classification:** web+backend
**Status:** Complete API Reference

---

## OpenAPI Specification

### Base Information
- **OpenAPI Version**: 3.0.3
- **Title**: Ganache Enterprise NAS API
- **Version**: 1.0.0
- **Description**: Complete REST API for storage management
- **Servers**: 
  - Development: `http://localhost:8080`
  - Production: `https://ganache.company.com:8443`

### Authentication

#### API Key Authentication
```http
GET /api/system/health
Authorization: Bearer your-api-key-here
Content-Type: application/json
```

#### Token-based Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure-password"
}

Response:
{
  "token": "jwt-token-here",
  "expires_at": "2025-12-14T19:50:00Z",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

### Rate Limiting

#### Limits
- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- **Volume operations**: 10 requests per minute

#### Rate Limit Headers
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Core Endpoints

### Volume Management

#### List Volumes
```http
GET /api/volumes
```

**Response:**
```json
{
  "volumes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "production-data",
      "size": 1099511627776,
      "type": "legacy_ha",
      "status": "active",
      "created_at": "2025-12-13T19:00:00Z",
      "updated_at": "2025-12-13T19:30:00Z",
      "metadata": {
        "drbd_resource": "ganache-vol1",
        "zpool": "tank"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

#### Create Volume
```http
POST /api/volumes
Content-Type: application/json

{
  "name": "new-volume",
  "size": 107374182400,
  "type": "native_zfs",
  "description": "Test volume for development",
  "options": {
    "compression": "lz4",
    "dedup": false
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "new-volume",
  "size": 107374182400,
  "type": "native_zfs",
  "status": "creating",
  "created_at": "2025-12-13T19:50:00Z",
  "estimated_completion": "2025-12-13T20:20:00Z"
}
```

#### Get Volume Details
```http
GET /api/volumes/{volumeId}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "production-data",
  "size": 1099511627776,
  "type": "legacy_ha",
  "status": "active",
  "health": "healthy",
  "created_at": "2025-12-13T19:00:00Z",
  "updated_at": "2025-12-13T19:30:00Z",
  "metadata": {
    "drbd_resource": "ganache-vol1",
    "zpool": "tank",
    "mount_point": "/mnt/ganache/vol1",
    "filesystem": "ext4"
  },
  "stats": {
    "used_bytes": 549755813888,
    "available_bytes": 549755813888,
    "inodes_used": 1000000,
    "inodes_available": 4000000
  },
  "snapshots": [
    {
      "id": "snapshot-uuid",
      "name": "daily-backup-2025-12-13",
      "created_at": "2025-12-13T02:00:00Z",
      "size": 53687091200
    }
  ]
}
```

#### Update Volume
```http
PUT /api/volumes/{volumeId}
Content-Type: application/json

{
  "name": "updated-volume-name",
  "description": "Updated description"
}
```

#### Delete Volume
```http
DELETE /api/volumes/{volumeId}
```

**Response:**
```json
{
  "message": "Volume deletion initiated",
  "volume_id": "550e8400-e29b-41d4-a716-446655440000",
  "estimated_completion": "2025-12-13T20:10:00Z"
}
```

#### Volume Operations

##### Mount Volume
```http
POST /api/volumes/{volumeId}/mount
Content-Type: application/json

{
  "mount_point": "/mnt/custom/path",
  "options": ["rw", "noatime"]
}
```

##### Unmount Volume
```http
POST /api/volumes/{volumeId}/unmount
```

##### Create Snapshot
```http
POST /api/volumes/{volumeId}/snapshots
Content-Type: application/json

{
  "name": "pre-deployment-backup",
  "description": "Snapshot before deployment"
}
```

##### List Snapshots
```http
GET /api/volumes/{volumeId}/snapshots
```

##### Restore Snapshot
```http
POST /api/volumes/{volumeId}/snapshots/{snapshotId}/restore
Content-Type: application/json

{
  "confirm": true,
  "create_current_snapshot": true
}
```

### System Information

#### System Health
```http
GET /api/system/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-13T19:50:00Z",
  "checks": {
    "storage_service": {
      "status": "up",
      "response_time_ms": 15
    },
    "database": {
      "status": "up",
      "response_time_ms": 5
    },
    "replication": {
      "status": "up",
      "latency_ms": 2,
      "sync_status": "synchronized"
    }
  },
  "version": "1.0.0",
  "uptime_seconds": 86400
}
```

#### System Information
```http
GET /api/system/info
```

**Response:**
```json
{
  "hostname": "ganache-server-01",
  "os": "Debian GNU/Linux 12 (bullseye)",
  "kernel": "6.1.0-20-amd64",
  "architecture": "x86_64",
  "cpu": {
    "model": "Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz",
    "cores": 16,
    "usage_percent": 25.5
  },
  "memory": {
    "total": 34359738368,
    "used": 16106127360,
    "available": 18253611008,
    "usage_percent": 46.9
  },
  "storage": {
    "total": 10995116277760,
    "used": 5497558138880,
    "available": 5497558138880,
    "usage_percent": 50.0
  },
  "network": {
    "interfaces": [
      {
        "name": "eth0",
        "ip": "192.168.1.10",
        "status": "up",
        "speed_mbps": 1000
      }
    ]
  },
  "cluster": {
    "nodes": [
      {
        "id": "node-1",
        "hostname": "ganache-server-01",
        "status": "master",
        "last_seen": "2025-12-13T19:50:00Z"
      }
    ]
  }
}
```

#### System Metrics
```http
GET /api/system/metrics
```

**Response:**
```json
{
  "timestamp": "2025-12-13T19:50:00Z",
  "metrics": {
    "cpu": {
      "usage_percent": 25.5,
      "load_average": [0.5, 0.3, 0.2]
    },
    "memory": {
      "usage_percent": 46.9,
      "cached_bytes": 2147483648,
      "buffer_bytes": 536870912
    },
    "storage": {
      "total_io_ops": 1500,
      "read_io_ops": 800,
      "write_io_ops": 700,
      "total_bandwidth_mbps": 250,
      "read_bandwidth_mbps": 120,
      "write_bandwidth_mbps": 130
    },
    "network": {
      "bytes_sent": 1048576000,
      "bytes_received": 2097152000,
      "packets_sent": 1500000,
      "packets_received": 2000000
    },
    "api": {
      "requests_per_minute": 45,
      "average_response_time_ms": 85,
      "error_rate_percent": 0.1
    }
  }
}
```

### Storage Operations

#### Initiate Backup
```http
POST /api/storage/{volumeId}/backup
Content-Type: application/json

{
  "destination": "proxmox-backup-server",
  "compression": "lz4",
  "encryption": true,
  "schedule": {
    "type": "once",
    "start_time": "2025-12-13T20:00:00Z"
  }
}
```

**Response:**
```json
{
  "job_id": "backup-job-uuid",
  "status": "running",
  "progress_percent": 0,
  "estimated_completion": "2025-12-13T21:30:00Z",
  "destination": "proxmox-backup-server"
}
```

#### Check Backup Status
```http
GET /api/storage/backups/{jobId}
```

**Response:**
```json
{
  "job_id": "backup-job-uuid",
  "status": "completed",
  "progress_percent": 100,
  "started_at": "2025-12-13T20:00:00Z",
  "completed_at": "2025-12-13T21:25:00Z",
  "size_bytes": 536870912000,
  "compressed_size_bytes": 161061273600,
  "destination": "proxmox-backup-server",
  "checksum": "sha256:abc123..."
}
```

#### List Backup Jobs
```http
GET /api/storage/backups
```

#### Cancel Backup Job
```http
DELETE /api/storage/backups/{jobId}
```

### User Management

#### List Users
```http
GET /api/users
```

**Response:**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "username": "admin",
      "email": "admin@company.com",
      "role": "admin",
      "status": "active",
      "created_at": "2025-12-13T10:00:00Z",
      "last_login": "2025-12-13T19:45:00Z"
    }
  ],
  "total": 1
}
```

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@company.com",
  "password": "secure-password",
  "role": "operator"
}
```

#### Update User
```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "email": "updated@company.com",
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/users/{userId}
```

#### User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}

Response:
{
  "id": "user-uuid",
  "username": "admin",
  "email": "admin@company.com",
  "role": "admin",
  "permissions": [
    "volumes:read",
    "volumes:write",
    "volumes:delete",
    "system:read",
    "users:read"
  ]
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VOLUME_NOT_FOUND",
    "message": "Volume with ID '550e8400-e29b-41d4-a716-446655440000' was not found",
    "details": {
      "volume_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-12-13T19:50:00Z",
      "request_id": "req_123456789"
    }
  }
}
```

### Error Codes

#### 4xx Client Errors
- `BAD_REQUEST` (400): Invalid request format
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `VALIDATION_ERROR` (422): Request validation failed
- `RATE_LIMITED` (429): Too many requests

#### 5xx Server Errors
- `INTERNAL_ERROR` (500): Internal server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable
- `TIMEOUT` (504): Request timeout

### Validation Rules

#### Volume Creation
```json
{
  "name": {
    "type": "string",
    "minLength": 1,
    "maxLength": 255,
    "pattern": "^[a-zA-Z0-9_-]+$"
  },
  "size": {
    "type": "integer",
    "minimum": 1073741824,
    "maximum": 10995116277760
  },
  "type": {
    "type": "string",
    "enum": ["legacy_ha", "native_zfs"]
  }
}
```

## Webhooks

### Webhook Events

#### Volume Events
```json
{
  "event": "volume.created",
  "timestamp": "2025-12-13T19:50:00Z",
  "data": {
    "volume_id": "550e8400-e29b-41d4-a716-446655440001",
    "volume_name": "new-volume",
    "volume_size": 107374182400,
    "volume_type": "native_zfs",
    "status": "active"
  }
}
```

#### System Events
```json
{
  "event": "system.health_changed",
  "timestamp": "2025-12-13T19:50:00Z",
  "data": {
    "previous_status": "healthy",
    "current_status": "degraded",
    "affected_services": ["storage_service"],
    "estimated_recovery": "2025-12-13T20:30:00Z"
  }
}
```

### Webhook Registration
```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://monitoring.company.com/webhooks/ganache",
  "events": ["volume.created", "volume.deleted", "system.health_changed"],
  "secret": "webhook-secret-key"
}
```

## Client Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

class GanacheClient {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createVolume(volumeData: {
    name: string;
    size: number;
    type: 'legacy_ha' | 'native_zfs';
  }) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/volumes`,
        volumeData,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error?.message}`);
      }
      throw error;
    }
  }

  async getVolume(volumeId: string) {
    const response = await axios.get(
      `${this.baseURL}/api/volumes/${volumeId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );
    return response.data;
  }

  async listVolumes() {
    const response = await axios.get(
      `${this.baseURL}/api/volumes`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );
    return response.data.volumes;
  }
}

// Usage
const client = new GanacheClient('https://ganache.company.com:8443', 'your-token');

// Create a volume
const newVolume = await client.createVolume({
  name: 'test-volume',
  size: 107374182400,
  type: 'native_zfs'
});

// List all volumes
const volumes = await client.listVolumes();
```

### Python
```python
import requests
import json

class GanacheClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_volume(self, name, size, volume_type):
        data = {
            'name': name,
            'size': size,
            'type': volume_type
        }
        
        response = requests.post(
            f'{self.base_url}/api/volumes',
            json=data,
            headers=self.headers
        )
        
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"API Error: {response.json()}")
    
    def get_volume(self, volume_id):
        response = requests.get(
            f'{self.base_url}/api/volumes/{volume_id}',
            headers=self.headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API Error: {response.json()}")
    
    def list_volumes(self):
        response = requests.get(
            f'{self.base_url}/api/volumes',
            headers=self.headers
        )
        
        if response.status_code == 200:
            return response.json()['volumes']
        else:
            raise Exception(f"API Error: {response.json()}")

# Usage
client = GanacheClient('https://ganache.company.com:8443', 'your-token')

# Create a volume
new_volume = client.create_volume('test-volume', 107374182400, 'native_zfs')

# List all volumes
volumes = client.list_volumes()
```

### cURL Examples

#### Authentication
```bash
# Login
curl -X POST https://ganache.company.com:8443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use token in subsequent requests
TOKEN="your-jwt-token"
```

#### Volume Operations
```bash
# List volumes
curl -X GET https://ganache.company.com:8443/api/volumes \
  -H "Authorization: Bearer $TOKEN"

# Create volume
curl -X POST https://ganache.company.com:8443/api/volumes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-volume",
    "size": 107374182400,
    "type": "native_zfs"
  }'

# Get volume details
curl -X GET https://ganache.company.com:8443/api/volumes/{volume-id} \
  -H "Authorization: Bearer $TOKEN"

# Delete volume
curl -X DELETE https://ganache.company.com:8443/api/volumes/{volume-id} \
  -H "Authorization: Bearer $TOKEN"
```

#### System Operations
```bash
# Check system health
curl -X GET https://ganache.company.com:8443/api/system/health \
  -H "Authorization: Bearer $TOKEN"

# Get system info
curl -X GET https://ganache.company.com:8443/api/system/info \
  -H "Authorization: Bearer $TOKEN"

# Get system metrics
curl -X GET https://ganache.company.com:8443/api/system/metrics \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Endpoints

### Postman Collection
```json
{
  "info": {
    "name": "Ganache API",
    "description": "Complete Ganache Enterprise NAS API collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://ganache.company.com:8443"
    },
    {
      "key": "token",
      "value": "{{auth_token}}"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}"
      }
    ]
  }
}
```

### Test Scripts
```javascript
// Pre-request script for authentication
if (!pm.environment.get('token')) {
    pm.sendRequest({
        url: pm.environment.get('baseUrl') + '/api/auth/login',
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                username: 'admin',
                password: 'password'
            })
        }
    }, function (err, response) {
        if (err) {
            console.log('Error:', err);
        } else {
            pm.environment.set('token', response.json().token);
        }
    });
}
```

---

**API documentation complete and tested**  
**Last Updated:** 2025-12-13  
**BMAD Compliance:** ✅ Complete  
**Ready for Integration:** ✅ Yes