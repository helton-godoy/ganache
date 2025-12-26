# Modelos de Dados - GANACHE

## Visão Geral

Os modelos de dados do GANACHE são definidos em Rust (`core/ganache-api/`) e sincronizados automaticamente com o frontend TypeScript via OpenAPI. Todos os modelos incluem validação Zod no frontend.

## Segurança

### SecurityEvent

**Descrição:** Representa um evento de segurança no sistema

```typescript
interface SecurityEvent {
  id: string; // ID único do evento
  timestamp: Date; // Quando ocorreu
  type: SecurityEventType; // Tipo: ssh, file, config
  user?: string; // Usuário envolvido
  ip?: string; // IP de origem
  action: string; // Ação realizada
  details: Record<string, any>; // Detalhes específicos
}
```

### SecurityAlert

**Descrição:** Alerta de segurança ativo

```typescript
interface SecurityAlert {
  id: string;
  type: string; // Tipo de alerta
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
}
```

## Cluster

### ClusterConfig

**Descrição:** Configuração para junção ao cluster

```typescript
interface ClusterConfig {
  primary_ip: string;
  secondary_ip: string;
  shared_secret: string;
}
```

### ClusterStatus

**Descrição:** Status atual do cluster HA

```typescript
interface ClusterStatus {
  primary_node: string;
  secondary_node?: string;
  status: "healthy" | "degraded" | "split_brain" | "failed";
  last_sync: Date;
  interconnect_status: "up" | "down";
}
```

## Storage (ZFS)

### PoolInfo

**Descrição:** Informações de um pool ZFS

```typescript
interface PoolInfo {
  name: string;
  size: number; // Tamanho total em bytes
  used: number; // Espaço usado
  available: number; // Espaço disponível
  status: string; // Online, degraded, etc.
  compression: string; // Algoritmo de compressão
  quota?: PoolQuota; // Configuração de quota
}
```

### DatasetInfo

**Descrição:** Informações de um dataset ZFS

```typescript
interface DatasetInfo {
  name: string;
  pool: string;
  mountpoint: string;
  used: number;
  available: number;
  compression: string;
  quota?: DatasetQuota;
  acl?: Nfs4Acl;
}
```

### PoolConfig / DatasetConfig

**Descrição:** Configuração para criação de pool/dataset

```typescript
interface PoolConfig {
  name: string;
  disks: string[]; // Lista de dispositivos
  raid_type: "mirror" | "raidz" | "raidz2";
  compression: "lz4" | "gzip" | "zstd";
}

interface DatasetConfig {
  name: string;
  pool: string;
  mountpoint: string;
  compression: string;
  quota?: DatasetQuota;
}
```

## Active Directory

### AdJoinRequest

**Descrição:** Solicitação de junção ao domínio AD

```typescript
interface AdJoinRequest {
  domain: string;
  username: string;
  password: string;
  organizational_unit?: string;
  dns_servers: string[];
}
```

### AdPrincipal

**Descrição:** Usuário ou grupo do Active Directory

```typescript
interface AdPrincipal {
  sid: string;
  name: string;
  type: "user" | "group";
  domain: string;
  display_name?: string;
}
```

## ACL (Access Control List)

### Nfs4Ace

**Descrição:** Entrada de controle de acesso NFSv4

```typescript
interface Nfs4Ace {
  index: number;
  type: "allow" | "deny";
  principal: AcePrincipal;
  permissions: Nfs4Permissions;
  flags: AceFlags;
}
```

### Nfs4Acl

**Descrição:** Lista completa de controle de acesso

```typescript
interface Nfs4Acl {
  aces: Nfs4Ace[];
  raw_output?: string; // Saída do getfacl
}
```

## Configuração e Histórico

### GitCommit

**Descrição:** Commit do Git representando mudança de configuração

```typescript
interface GitCommit {
  hash: string;
  author: string;
  email: string;
  timestamp: Date;
  message: string;
  changes: GitFileDiff[];
}
```

### GitDiff

**Descrição:** Diff de mudanças em arquivos de configuração

```typescript
interface GitDiff {
  files: GitFileDiff[];
  summary: {
    insertions: number;
    deletions: number;
    files_changed: number;
  };
}
```

## Hardware

### HardwareInfo

**Descrição:** Informações de hardware detectado

```typescript
interface HardwareInfo {
  controller_name: string;
  controller_type: "perc6i" | "h700" | "other";
  disks: DiskInfo[];
  memory_gb: number;
  cpu_cores: number;
}
```

### DiskInfo

**Descrição:** Informações de um disco

```typescript
interface DiskInfo {
  device: string; // /dev/sda
  model: string;
  size_gb: number;
  type: "hdd" | "ssd";
  status: "online" | "offline";
}
```

## Sistema

### SystemResources

**Descrição:** Recursos atuais do sistema

```typescript
interface SystemResources {
  cpu_usage: number; // Percentual
  memory_used: number; // MB
  memory_total: number; // MB
  disk_usage: Record<string, number>; // Por mountpoint
  uptime_seconds: number;
}
```

### SystemLog

**Descrição:** Entrada de log do sistema

```typescript
interface SystemLog {
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  component: string;
  message: string;
  details?: Record<string, any>;
}
```

## Validação e Serialização

- **Backend:** Usa Serde para serialização JSON
- **Frontend:** Usa Zod para validação em runtime
- **OpenAPI:** Gera especificações automaticamente
- **TypeScript:** Tipos gerados automaticamente do OpenAPI

## Relacionamentos

- **SecurityEvent** → **SecurityAlert**: Eventos podem gerar alertas
- **PoolInfo** → **DatasetInfo**: Datasets pertencem a pools
- **AdPrincipal** → **Nfs4Ace**: Principais AD usados em ACLs
- **GitCommit** → **SystemLog**: Commits relacionados a logs

## Migrações

- Schema migrations gerenciadas via arquivos SQL em `core/ganache-lib/migrations/`
- Versionamento automático via timestamps
- Rollback support para todas as mudanças
