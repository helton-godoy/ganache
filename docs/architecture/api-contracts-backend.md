# API Contracts - Ganache Backend

**Versão da API:** 1.0.0
**Protocolo:** REST / HTTP
**Base URL:** `/ganache` (observado via schema)

## 📌 Visão Geral

A API do Ganache fornece endpoints para gerenciamento de compartilhamentos SMB, armazenamento ZFS e monitoramento do sistema.

## 📡 Endpoints

### SMB Management

**Scope:** `/smb`

#### List SMB Shares

- **Rota:** `GET /smb/shares` (via schema) / `GET /smb/list` (internal route)
- **Descrição:** Retorna a lista de todos os compartilhamentos SMB ativos.
- **Response (200 OK):**

  ```json
  [
    {
      "name": "financeiro",
      "path": "/mnt/tank/financeiro",
      "guest_ok": false,
      "read_only": false
    }
  ]
  ```

#### Create SMB Share

- **Rota:** `POST /smb/shares` (via schema) / `POST /smb/create` (internal route)
- **Descrição:** Cria um novo compartilhamento SMB.
- **Body:** `SmbShareConfig`

  ```json
  {
    "name": "novoshare",
    "path": "/mnt/tank/novoshare",
    "guest_ok": false
  }
  ```

#### Delete SMB Share

- **Rota:** `DELETE /smb/delete/{id}` (internal)
- **Descrição:** Remove um compartilhamento existente.

### Storage & ZFS

**Scope:** `/zfs`

#### List ZFS Pools

- **Rota:** `GET /storage/zfs` (via schema) / `GET /zfs/pools` (internal)
- **Descrição:** Lista pools ZFS e status de saúde.
- **Response:** `ZfsPool[]`

#### List ZFS Datasets

- **Rota:** `GET /storage/zfs/datasets` (via schema) / `GET /zfs/datasets` (internal)
- **Descrição:** Lista datasets e uso de espaço.

#### Create ZFS Snapshot

- **Rota:** `POST /zfs/snapshot` (internal)
- **Body:** `{ "dataset": "tank/data" }`
- **Response:** Snapshot criado com timestamp automático (ex: `tank/data@auto-20251214_120000`).

### System Monitoring

**Scope:** `/system` / `/nodes`

#### Get Node Status

- **Rota:** `GET /nodes/localhost/status` (via schema) / `GET /system/status` (internal)
- **Descrição:** Retorna métricas vitais do sistema (CPU, RAM, Uptime). Compatível com Proxmox Backup Server (PBS).
- **Response:** `NodeStatus`

  ```json
  {
    "uptime": 12345,
    "cpu": 0.15,
    "memory": {
      "total": 16000000000,
      "used": 8000000000
    }
  }
  ```

#### System Info

- **Rota:** `GET /system/info`
- **Descrição:** Informações estáticas do host (Kernel, Versão, Arquitetura).

## 🔒 Autenticação

*(A ser documentado - Padrões de segurança detectados: N/A nos arquivos analisados)*
