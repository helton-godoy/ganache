# Arquitetura de Integração - GANACHE

## Visão Geral

O GANACHE implementa uma arquitetura de integração robusta entre frontend React/Next.js e backend Rust/Axum, utilizando padrões modernos de comunicação cliente-servidor com foco em type safety e performance.

## Padrão de Comunicação

### Contrato-First com OpenAPI

- **Fonte da Verdade:** `core/ganache-api/` define todos os contratos
- **Geração Automática:** OpenAPI spec gerado do código Rust
- **SDK Frontend:** Hooks TypeScript gerados automaticamente via Orval
- **Type Safety:** Tipos sincronizados entre backend e frontend

### Fluxo de Dados

```
Frontend (React) ↔ API Layer (Orval) ↔ Backend (Axum)
       ↓
   React Query (Cache)
       ↓
   Zustand (Client State)
```

## Protocolos de Comunicação

### REST API (Primário)

- **Base URL:** `http://localhost:8080/api/v1`
- **Autenticação:** Bearer tokens (JWT)
- **Content-Type:** `application/json`
- **Versionamento:** Path-based (`/v1/`)
- **Rate Limiting:** 1000 req/min por IP

### WebSocket (Tempo Real)

- **Endpoint:** `/api/v1/security/events/ws`
- **Protocolo:** WebSocket seguro (WSS em produção)
- **Uso:** Eventos de segurança em tempo real
- **Reconexão:** Automática com backoff exponencial
- **Estado:** Gerenciado via hook `useSecurityEvents`

### Server-Sent Events (SSE)

- **Endpoint:** `/api/v1/security/events/stream`
- **Uso:** Streaming unidirecional de eventos
- **Fallback:** Para browsers sem WebSocket

## Gerenciamento de Estado

### Frontend State Management

#### React Query (Server State)
- **Uso:** Dados da API, cache inteligente
- **Benefícios:** Sincronização automática, cache, retry
- **Hooks:** `useQuery`, `useMutation`, `useInfiniteQuery`

#### Zustand (Client State)
- **Uso:** Estado local da UI (modais, filtros, formulários)
- **Benefícios:** Simples, type-safe, middleware
- **Padrão:** Stores por domínio

### Backend State Management

#### In-Memory Cache
- **Tecnologia:** DashMap para concorrência
- **Uso:** Cache de eventos de segurança, métricas
- **Persistência:** Opcional via Redis (futuro)

#### Database Layer
- **Tecnologia:** ZFS datasets + arquivos
- **Acesso:** Via `ganache-lib` com abstrações seguras
- **Transações:** Git-based para configuração

## Padrões de Integração

### API Client Pattern

```typescript
// Hook gerado automaticamente
const { data: events, isLoading } = useSecurityEventsQuery({
  type: 'ssh',
  limit: 100
});

// Mutation com otimistic updates
const acknowledgeAlert = useAcknowledgeAlertMutation();
await acknowledgeAlert.mutateAsync({ id: alertId });
```

### Error Handling

#### Frontend
- **React Query:** Retry automático, error boundaries
- **Zod:** Validação de responses
- **User Feedback:** Toasts para erros

#### Backend
- **Axum:** Error responses estruturadas
- **Tracing:** Logs detalhados com spans
- **Validation:** Serde validation + custom validators

### Loading States

- **Skeleton UI:** Para loading inicial
- **Progressive Enhancement:** Funcionalidade básica primeiro
- **Optimistic Updates:** UI responde imediatamente

## Segurança da Integração

### Autenticação
- **JWT Tokens:** Assinados com chaves RSA
- **Refresh Tokens:** Rota dedicada para renovação
- **Session Management:** Timeout configurável

### Autorização
- **Role-Based Access:** sudo allow-list
- **API Scopes:** Granular permissions
- **Audit Logging:** Todas as operações logadas

### Transport Security
- **HTTPS Only:** Em produção
- **CORS:** Configurado para domínios específicos
- **CSP Headers:** Content Security Policy

## Performance e Escalabilidade

### Otimização de Requests

- **Batching:** Múltiplas operações em uma request
- **Pagination:** Cursor-based para listas grandes
- **Compression:** Gzip para responses >1KB

### Cache Strategy

- **Browser Cache:** HTTP caching headers
- **React Query:** Intelligent cache invalidation
- **CDN:** Static assets via CDN

### Monitoring

- **API Metrics:** Response times, error rates
- **Client Metrics:** Page load times, API call latency
- **Real-time Dashboards:** Via WebSocket connections

## Testes de Integração

### Estratégia de Testes

- **Unit Tests:** Componentes isolados
- **Integration Tests:** API contracts
- **E2E Tests:** Playwright para fluxos completos
- **Contract Tests:** OpenAPI compliance

### Test Data

- **Factories:** Dados de teste realistas
- **Fixtures:** Estados conhecidos do sistema
- **Mocking:** External dependencies

## Desenvolvimento e Deploy

### Desenvolvimento Local

```bash
# Frontend
npm run dev  # http://localhost:3000

# Backend
cd core && cargo run  # http://localhost:8080

# API Generation
npm run generate-api  # Atualiza hooks TypeScript
```

### CI/CD Pipeline

- **Build:** Type check + lint + test
- **API Generation:** OpenAPI spec validation
- **Contract Testing:** API compatibility
- **Deploy:** Blue-green com health checks

## Troubleshooting

### Problemas Comuns

**Type Mismatch:**
- Regenerar API: `npm run generate-api`
- Verificar OpenAPI spec em `core/ganache-api/`

**CORS Errors:**
- Verificar configuração do Axum
- Headers de preflight

**WebSocket Disconnects:**
- Verificar reconexão automática
- Logs do backend para connection drops

**Cache Issues:**
- Invalidar React Query cache
- Clear browser cache

## Roadmap de Integração

- **GraphQL:** Para queries complexas (planejado)
- **gRPC:** Para comunicação interna (avaliando)
- **Service Mesh:** Istio para observabilidade (futuro)
- **API Gateway:** Para rate limiting avançado (planejado)