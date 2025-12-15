---
title: "Project Overview"
category: "overview"
project_type: "web+backend"
created: "2025-12-15"
updated: "2025-12-15"
author: "Antigravity"
status: "approved"
version: "1.0.0"
tags: ["bmad", "documentation", "overview"]
bmad_compliance: true
---

# Project Overview - Ganache

**Projeto:** Ganache Enterprise NAS
**Classificação:** Multi-part System (Rust + React)
**Arquitetura:** Client-Server Monorepo

## 🎯 Propósito e Função

O Ganache é uma solução de gerenciamento de sistemas (NAS - Network Attached Storage) focada em performance e usabilidade. Ele oferece uma interface web moderna para administração de recursos como:

- **Monitoramento de Sistema:** Métricas em tempo real de CPU, RAM e Uptime.
- **Gerenciamento ZFS:** Visualização de Pools, Datasets e criação de Snapshots.
- **Protocolo SMB:** Configuração e gerenciamento facilitado de compartilhamentos de rede Samba.

## 🏗️ Estrutura do Sistema

O projeto adota uma arquitetura desacoplada onde um backend robusto em Rust gerencia as operações de baixo nível, enquanto um frontend leve em React fornece a experiência do usuário.

| Componente | Tecnologia | Responsabilidade |
|------------|------------|------------------|
| **Backend** | Rust + Actix | API REST, ZFS syscalls, Configuração SMB |
| **Frontend** | React + Vite | Dashboard, Formulários de gestão |
| **Integração** | OpenAPI | Contrato de comunicação automatizado |

## 🔗 Navegação Rápida

- **Arquitetura Técnica:** [Backend](./architecture/architecture-backend.md) | [Frontend](./architecture/architecture-frontend.md)
- **Integração:** [Contrato de API e Fluxo de Dados](./architecture/integration-architecture.md)
- **Desenvolvimento:** [Guia de Setup e Build](./development/development-guide.md)
- **Operação:** [Guia de Deploy](./handoff/deployment-guide.md)

## 📊 Stack Tecnológico

![Tech Stack](https://skillicons.dev/icons?i=rust,react,ts,vite,docker,linux&perline=6)

- **Linguagem Base:** Rust (Performance) & TypeScript (Segurança de Tipos)
- **UI Framework:** Material UI v5
- **State:** Zustand
- **Protocol:** HTTP/REST (OpenAPI v3)
