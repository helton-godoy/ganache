# Contratos de API - GANACHE

## Visão Geral

A API do GANACHE segue o padrão REST com OpenAPI 3.0, implementada em Rust usando Axum. Todos os contratos são definidos em `core/ganache-api/` e gerados automaticamente para o frontend via Orval.

## Base URL
```
http://localhost:8080/api/v1
```

## Autenticação
- Bearer Token (JWT)
- Headers: `Authorization: Bearer <token>`

## Endpoints Principais

### Sistema (/system)

#### GET /system/hardware
**Descrição:** Informações de hardware detectado
**Resposta:** `HardwareInfo`

#### GET /system/resources
**Descrição:** Recursos atuais do sistema
**Resposta:** `SystemResources`

#### GET /system/logs
**Descrição:** Logs do sistema
**Parâmetros:** `level`, `limit`
**Resposta:** Array de `SystemLog`

#### GET /system/boot-environments
**Descrição:** Lista ambientes de boot
**Resposta:** Array de `BootEnvironment`

#### POST /system/boot-environments/activate
**Descrição:** Ativar ambiente de boot
**Corpo:** `BootEnvironmentActivation`

#### POST /system/promote
**Descrição:** Promover nó para primary

### Cluster (/cluster)

#### POST /cluster/configure
**Descrição:** Configurar cluster
**Corpo:** `ClusterConfig`
**Resposta:** `ClusterStatus`

#### GET /cluster/status
**Descrição:** Status do cluster
**Resposta:** `ClusterStatus`

#### POST /cluster/simulate-failure
**Descrição:** Simular falha (teste)

#### POST /cluster/heartbeat
**Descrição:** Heartbeat do cluster

### Storage (/storage)

#### GET /storage/drbd-devices
**Descrição:** Lista dispositivos DRBD disponíveis
**Resposta:** Array de `StorageDevice`

#### POST /storage/create-pool
**Descrição:** Criar pool ZFS
**Corpo:** `PoolConfig`
**Resposta:** `PoolInfo`

#### GET /storage/pools
**Descrição:** Lista pools ZFS
**Resposta:** Array de `PoolInfo`

#### GET /storage/disks
**Descrição:** Lista discos disponíveis
**Resposta:** Array de `DiskInfo`

#### GET /storage/datasets
**Descrição:** Lista datasets ZFS
**Parâmetros:** `pool`
**Resposta:** Array de `DatasetInfo`

#### POST /storage/datasets
**Descrição:** Criar dataset
**Corpo:** `DatasetConfig`
**Resposta:** `DatasetInfo`

#### POST /storage/datasets/delete
**Descrição:** Remover dataset
**Corpo:** `DeleteDatasetPayload`

### Configuração (/config)

#### GET /config/history
**Descrição:** Histórico de mudanças de configuração
**Parâmetros:** `limit`, `user`
**Resposta:** Array de `GitCommit`

#### GET /config/history/{commit_id}/diff
**Descrição:** Diff de commit específico
**Resposta:** `GitDiff`

#### POST /config/rollback
**Descrição:** Rollback de configuração
**Corpo:** `RollbackRequest`
**Resposta:** `RollbackResponse`

### Active Directory (/ad)

#### POST /ad/join
**Descrição:** Juntar ao domínio AD
**Corpo:** `AdJoinRequest`
**Resposta:** `AdJoinResponse`

#### GET /ad/status
**Descrição:** Status da integração AD
**Resposta:** `AdStatus`

#### POST /ad/leave
**Descrição:** Sair do domínio AD

#### GET /acl/principals
**Descrição:** Buscar usuários/grupos AD
**Parâmetros:** `query`, `type`
**Resposta:** `AdSearchResponse`

### ACL (/acl)

#### GET /acl/{path}
**Descrição:** Obter ACL de arquivo/diretório
**Parâmetros:** `path` (path)
**Resposta:** `GetAclResponse`

#### POST /acl/{path}
**Descrição:** Definir ACL
**Corpo:** `SetAclRequest`
**Resposta:** `SetAclResponse`

### Segurança (/security)

#### GET /security/events
**Descrição:** Lista eventos de segurança com filtros
**Parâmetros:** `type`, `user`, `ip`, `limit`
**Resposta:** Array de `SecurityEvent`

#### POST /security/events
**Descrição:** Injetar evento de segurança (teste)

#### GET /security/events/ws
**Descrição:** WebSocket para eventos em tempo real
**Protocolo:** WebSocket

#### GET /security/metrics
**Descrição:** Métricas agregadas de segurança
**Resposta:** `SecurityMetrics`

#### GET /security/alerts
**Descrição:** Alertas ativos de segurança
**Resposta:** Array de `SecurityAlert`

#### POST /security/alerts/acknowledge
**Descrição:** Reconhecer alerta de segurança
**Corpo:** Reconhecimento de alerta

#### POST /security/break-glass/activate
**Descrição:** Ativar conta Break-Glass
**Corpo:** `BreakGlassActivateRequest`

#### POST /security/break-glass/deactivate
**Descrição:** Desativar conta Break-Glass
**Corpo:** `BreakGlassDeactivateRequest`

#### GET /security/break-glass/status
**Descrição:** Status da conta Break-Glass
**Resposta:** `BreakGlassStatusResponse`

#### POST /security/break-glass/validate-password
**Descrição:** Validar senha Break-Glass
**Corpo:** `PasswordValidationRequest`

### Cluster (/cluster)

#### GET /cluster/status
**Descrição:** Status atual do cluster
**Resposta:** `ClusterStatus`

#### POST /cluster/join
**Descrição:** Juntar nó ao cluster
**Corpo:** `ClusterConfig`

### Storage (/storage)

#### GET /storage/pools
**Descrição:** Lista pools ZFS
**Resposta:** Array de `PoolInfo`

#### POST /storage/pools
**Descrição:** Criar novo pool ZFS
**Corpo:** `PoolConfig`

#### GET /storage/datasets
**Descrição:** Lista datasets ZFS
**Parâmetros:** `pool` (query)
**Resposta:** Array de `DatasetInfo`

#### POST /storage/datasets
**Descrição:** Criar novo dataset
**Corpo:** `DatasetConfig`

#### DELETE /storage/datasets/{id}
**Descrição:** Remover dataset
**Corpo:** `DeleteDatasetPayload`

### Active Directory (/ad)

#### POST /ad/join
**Descrição:** Juntar ao domínio AD
**Corpo:** `AdJoinRequest`
**Resposta:** `AdJoinResponse`

#### GET /ad/status
**Descrição:** Status da integração AD
**Resposta:** `AdStatus`

#### GET /ad/principals
**Descrição:** Buscar usuários/grupos AD
**Parâmetros:** `query`, `type`
**Resposta:** `AdSearchResponse`

### ACL (/acl)

#### GET /acl/{path}
**Descrição:** Obter ACL de arquivo/diretório
**Parâmetros:** `path` (path)
**Resposta:** `GetAclResponse`

#### POST /acl/{path}
**Descrição:** Definir ACL
**Corpo:** `SetAclRequest`
**Resposta:** `SetAclResponse`

### Configuração (/config)

#### GET /config/history
**Descrição:** Histórico de mudanças de configuração
**Parâmetros:** `limit`, `user`
**Resposta:** Array de `GitCommit`

#### POST /config/rollback
**Descrição:** Rollback de configuração
**Corpo:** `RollbackRequest`
**Resposta:** `RollbackResponse`

### Hardware (/hardware)

#### GET /hardware/info
**Descrição:** Informações de hardware detectado
**Resposta:** `HardwareInfo`

#### GET /hardware/disks
**Descrição:** Lista discos disponíveis
**Resposta:** Array de `DiskInfo`

### Sistema (/system)

#### GET /system/resources
**Descrição:** Recursos do sistema
**Resposta:** `SystemResources`

#### GET /system/logs
**Descrição:** Logs do sistema
**Parâmetros:** `level`, `limit`
**Resposta:** Array de `SystemLog`

## Modelos de Dados

### SecurityEvent
```typescript
{
  id: string;
  timestamp: string;
  type: "ssh" | "file" | "config";
  user?: string;
  ip?: string;
  action: string;
  details: object;
}
```

### ClusterStatus
```typescript
{
  primary_node: string;
  secondary_node?: string;
  status: "healthy" | "degraded" | "failed";
  last_sync: string;
}
```

### PoolInfo
```typescript
{
  name: string;
  size: number;
  used: number;
  available: number;
  status: string;
  compression: string;
}
```

## Códigos de Erro

- `400`: Bad Request - Dados inválidos
- `401`: Unauthorized - Token inválido
- `403`: Forbidden - Permissões insuficientes
- `404`: Not Found - Recurso não encontrado
- `409`: Conflict - Conflito de estado
- `422`: Unprocessable Entity - Validação falhou
- `500`: Internal Server Error - Erro interno

## Rate Limiting

- 1000 requisições por minuto por IP
- Headers de resposta incluem limites atuais

## Versionamento

- API versionada via URL path (`/v1/`)
- Breaking changes incrementam versão
- Depreciação gradual com headers `Deprecation`

## Documentação Técnica

- OpenAPI spec: `core/ganache-api/openapi.json`
- SDK gerado: `src/api/generated/`
- Testes API: `tests/api/`