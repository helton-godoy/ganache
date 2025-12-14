# Integration Architecture - Ganache

**Tipo de Integração:** Client-Server Monorepo
**Protocolo:** REST / HTTP + JSON
**Contrato:** OpenAPI v3 (`api-spec.yaml`)

## 🔄 Fluxo de Dados

```mermaid
graph LR
    User[Usuário] -->|Interage| UI[Ganache UI (React)]
    UI -->|Action| Store[Zustand Store]
    Store -->|Call| Client[OpenAPI Client]
    Client -->|HTTP Request| API[Ganache Backend (Actix)]
    API -->|Syscall| System[Linux/ZFS/Samba]
    System -->|Result| API
    API -->|JSON Response| Client
    Client -->|Update| Store
    Store -->|Render| UI
```

## 📜 Contrato de Interface (OpenAPI)

A integridade da comunicação é garantida pelo arquivo `api-spec.yaml` localizado na raiz do projeto `ganache/`.

### Geração de Código

- **Frontend:** O comando `npm run api:gen` utiliza `openapi-typescript` para ler o `api-spec.yaml` e gerar as tipagens TypeScript em `ui/src/api/schema.d.ts`.
- **Backend:** (Recomendado) O backend deve implementar as rotas conforme definido na spec para garantir compatibilidade.

### Pontos de Integração

| Endpoint | Uso | Dados (Request/Response) |
|---|---|---|
| `/smb/shares` | Listagem e Criação de SMB | `SmbShare[]`, `SmbShareConfig` |
| `/storage/zfs` | Gestão de ZFS Pools | `ZfsPool[]` |
| `/system/status` | Monitoramento em Tempo Real | `NodeStatus` |

## 🛡️ Tratamento de Erros

O frontend implementa um wrapper em `client.ts` (`handleApiError`) que normaliza os erros HTTP retornados pelo backend, garantindo que a UI receba mensagens amigáveis ou códigos de erro estruturados.
