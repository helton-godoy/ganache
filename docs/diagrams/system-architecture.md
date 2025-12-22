# Diagrama de Arquitetura do Sistema Ganache

Este diagrama ilustra a arquitetura geral do sistema Ganache, mostrando a separação entre frontend, backend e sistema operacional, com foco na integração entre componentes.

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[SPA Single Page Application]
        B[App Router React 19]
        C[Shadcn + Radix UI]
        D[Tailwind CSS + Framer Motion]
        E[TanStack React Query]
        F[Zustand State Management]
        G[React Hook Form + Zod]
    end

    subgraph "Backend (Rust)"
        H[ganache-core<br/>Daemon Axum + Tokio]
        I[ganache-api<br/>Contratos OpenAPI + Serde]
        J[ganache-lib<br/>System Wrappers ZFS/DRBD]
    end

    subgraph "Sistema Operacional"
        K[ZFS Pool]
        L[DRBD Replication]
        M[Hardware RAID]
        N[Debian OS]
    end

    A --> H
    H --> I
    H --> J
    J --> K
    J --> L
    L --> M
    H --> N

    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef system fill:#e8f5e8

    class A,B,C,D,E,F,G frontend
    class H,I,J backend
    class K,L,M,N system