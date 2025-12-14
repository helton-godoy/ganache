# Architecture - Ganache UI

**Parte:** Frontend
**Linguagem:** TypeScript
**Framework:** React 18

## 🏗️ Padrão Arquitetural

O frontend utiliza uma arquitetura **Component-Store**, separando a view da lógica de estado global.

### Diagrama de Camadas

```
[View Layer (React Components)]
       ^       |
       | (Sub) | (Action)
       |       v
[State Layer (Zustand Stores)]
       ^       |
       | (Data)| (Call)
       |       v
[Network Layer (OpenAPI Client)]
```

## 🧩 Componentes Chave

1. **View Layer (`components/`):**
    - **Dashboard:** Consumidor puro de dados de monitoramento.
    - **SmbManager:** Interface interativa (CRUD) para shares.
    - Utiliza **Material UI** para consistência visual.

2. **State Layer (`stores/`):**
    - **Atomic Stores:** Separação por domínio (`systemStore`, `smbStore`).
    - **Responsabilidade:** Manter o estado da UI sincronizado com o servidor. Cache simples e controle de `loading`/`error`.

3. **Network Layer (`api/`):**
    - **Type-Safety:** `schema.d.ts` gerado automaticamente garante que o código TS esteja alinhado com a API Spec.
    - **Abstraction:** `client.ts` isola a complexidade do `fetch` e tratamento de erros.

## 🚀 Performance e Build

- **Vite:** Utilizado para Hot Module Replacement (HMR) e builds de produção otimizados.
- **Bundle Strategy:** SPA único (Single Page Application).
