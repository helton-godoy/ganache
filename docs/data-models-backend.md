# Data Models - Ganache System

**Fonte da Verdade:** OpenAPI Schema (`api-spec.yaml` / `schema.d.ts`)

## 💾 Modelos de Dados

### SMB (Samba)

#### `SmbShare`

Representa um compartilhamento de arquivo ativo.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do compartilhamento. |
| `path` | string | Caminho absoluto no sistema de arquivos. |
| `guest_ok` | boolean | Se permite acesso convidado. |
| `read_only` | boolean | Se é somente leitura. |
| `comment` | string | Descrição opcional. |

#### `SmbShareConfig` (Input)

Configuração para criar um novo share.

- Validação: Nome alfanumérico.
- Opções extras: `timemachine` (suporte Apple).

### ZFS (Storage)

#### `ZfsPool`

Pool de armazenamento ZFS.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Identificador do Pool. |
| `health` | enum | ONLINE, DEGRADED, FAULTED, etc. |
| `size` | number | Tamanho total (bytes). |
| `free` | number | Espaço livre. |
| `allocated`| number | Espaço ocupado. |

#### `ZfsDataset`

Dataset lógico dentro de um pool.

- Atributos: `compression` (lz4), `atime` (access time tracking).
- Relação: Pertence a um `pool`.

### System

#### `NodeStatus`

Snapshot de performance do nó.

- **CPU:** Float (0.0 - 1.0).
- **RAM:** Objeto aninhado (total, used, available).
- **Load Average:** Array [1m, 5m, 15m].
