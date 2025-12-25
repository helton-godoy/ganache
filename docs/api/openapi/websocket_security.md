# API Section: websocket_security

## GET /api/v1/security/events/ws

**Summary**: WebSocket upgrade handler

# Purpose
Handles WebSocket upgrade and starts event streaming

@ref Story-5.4 - WebSocket endpoint

**Operation ID**: `ws_security_events`

### Example Usage (TypeScript SDK)

```typescript
import { useWs_security_events } from '@/api/generated';

const { mutate, data } = useWs_security_events();
// Call mutate(...) or use data
```

---

