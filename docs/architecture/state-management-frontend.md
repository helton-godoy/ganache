# State Management - Ganache Frontend

**Biblioteca:** Zustand v4
**Padrão:** Stores isoladas por domínio.

## 📦 Stores

### System Store (`useSystemStore`)

Gerencia o estado global de monitoramento do sistema.

- **Arquivo:** `src/stores/systemStore.ts`
- **State:**
  - `status`: Objeto `NodeStatus` (CPU, RAM, Uptime).
- **Actions:**
  - `fetchStatus()`: Busca dados do endpoint de status.

### SMB Store (`useSmbStore`)

Gerencia o ciclo de vida dos compartilhamentos SMB.

- **Arquivo:** `src/stores/smbStore.ts`
- **State:**
  - `shares`: Array de `SmbShare`.
  - `loading`: Booleano para feedback de UI.
  - `error`: Mensagens de erro da API.
- **Actions:**
  - `fetchShares()`: Carrega lista de shares.
  - `createShare(config)`: Cria novo share e atualiza a lista automaticamente.
  - `clearError()`: Reseta estados de erro.

## 📡 Integração com API

As stores utilizam um cliente API tipado (`src/api/client.ts`) que consome as definições geradas pelo OpenAPI (`schema.d.ts`).

- **Tratamento de Erros:** Centralizado (`handleApiError`).
- **Fluxo:** Action -> API Call -> Set State (Loading/Success/Error).
