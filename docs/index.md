# GANACHE - Documentação do Projeto

## Visão Geral do Projeto

- **Tipo:** Monorepo com 2 partes
- **Linguagem Principal:** TypeScript/Rust
- **Arquitetura:** Aplicação web com backend Rust

## Referência Rápida

### Frontend (Web)

- **Pilha de Tecnologia:** Next.js, TypeScript, Tailwind CSS, React Query
- **Ponto de Entrada:** src/app/
- **Arquitetura Padrão:** Componentes React com API REST

### Backend (Backend)

- **Pilha de Tecnologia:** Rust, Axum, Tokio
- **Ponto de Entrada:** core/ganache-core/src/main.rs
- **Arquitetura Padrão:** API REST com middleware

## Documentação Gerada

- [Visão Geral do Projeto](./project-overview.md)
- [Arquitetura](./architecture.md)
- [Análise da Árvore de Fontes](./source-tree-analysis.md)
- [Inventário de Componentes](./component-inventory.md)
- [Guia de Desenvolvimento](./development-guide.md)
- [Contratos de API](./api-contracts.md)
- [Modelos de Dados](./data-models.md)
- [Arquitetura de Integração](./integration-architecture.md)

## Documentação Existente

- [README](./../README.md)
- [Contexto do Projeto](./../project-context.md)
- [Epics](./epics.md)
- [PRD](./PRD.md)
- [Especificação de Design UX](./ux-design-specification.md)
- [Artefatos de Sprint](./sprint-artifacts/)

## Primeiros Passos

1. Clone o repositório
2. Para frontend: `cd src && npm install && npm run dev`
3. Para backend: `cd core && cargo build && cargo run`

---

_Documentação gerada automaticamente pelo workflow document-project (varredura rápida)_
