---
title: "Documentation Index"
category: "index"
project_type: "web+backend"
created: "2025-12-15"
updated: "2025-12-15"
author: "Antigravity"
status: "approved"
version: "1.0.0"
tags: ["bmad", "documentation", "index"]
bmad_compliance: true
---

# Ganache Enterprise NAS - Documentation IndexTécnica (BMAD)

**Data da Geração:** 2025-12-14
**Versão Doc:** 1.2.0 (Full Rescan)
**Tipo de Projeto:** Multi-part (Backend + Frontend)

## 📌 Índice Principal

### 🔎 Visão Geral

Entenda o propósito e a estrutura macro do projeto.

- **[Project Overview](./project-overview-ganache.md)** - O que é o Ganache?
- **[Source Tree Analysis](./architecture/source-tree-analysis.md)** - Mapa detalhado de arquivos e pastas.

### 🏗️ Arquitetura

Documentação técnica profunda sobre como o sistema é construído.

- **[Architecture - Backend](./architecture/architecture-backend.md)** - Estrutura do serviço Rust/Actix.
- **[Architecture - Frontend](./architecture/architecture-frontend.md)** - Estrutura da aplicação React/Vite.
- **[Integration Architecture](./architecture/integration-architecture.md)** - Como Backend e Frontend se comunicam.

### ⚙️ Guias de Desenvolvimento

Para desenvolvedores que desejam contribuir ou rodar o projeto.

- **[Development Guide](./development/development-guide.md)** - Setup, rodar localmente e testes.
- **[Deployment Guide](./handoff/deployment-guide.md)** - Instalação e operação em produção (Linux/Systemd).

### 📖 Referência de API e Dados

Detalhes de implementação e contratos de interface.

- **[API Contracts (Backend)](./architecture/api-contracts-backend.md)** - Endpoints REST documentados.
- **[Data Models](./architecture/data-models-backend.md)** - Esquemas de dados (SMB, ZFS, System).

### 🧩 Frontend Internals

Detalhes específicos da implementação de UI.

- **[UI Component Inventory](./architecture/ui-component-inventory-frontend.md)** - Catálogo de componentes (Dashboard, Managers).
- **[State Management](./architecture/state-management-frontend.md)** - Arquitetura de estado (Zustand).

---

## 🚀 Getting Started

1. **Clone o repositório**
2. **Leia o [Guia de Desenvolvimento](./development/development-guide.md)**
3. **Execute o Setup:** `./scripts/setup_ganache_enhanced.sh`

---

*Gerado automaticamente pelo workflow BMAD document-project.*
