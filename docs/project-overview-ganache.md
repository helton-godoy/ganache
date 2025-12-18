---
created: "2025-12-15"
updated: "2025-12-17"
author: "Antigravity"
status: "approved"
version: "1.1.0"
tags: ["bmad", "documentation", "overview"]
bmad_compliance: true
---

# Project Overview - Ganache

**Projeto:** Ganache Enterprise NAS
**Classificação:** Single-Page Application / Web Appliance
**Arquitetura:** Modern Monolith (Next.js App Router)

## 🎯 Propósito e Função

O Ganache é uma solução de gerenciamento de sistemas (NAS - Network Attached Storage) focada em simplicidade, segurança e performance. Ele oferece uma interface web moderna para administração completa de storage appliances, eliminando a necessidade de CLI.

- **Monitoramento de Sistema:** Métricas em tempo real de CPU, RAM, Uptime e saúde dos discos.
- **Gerenciamento ZFS:** Visualização e controle total de Pools, Datasets e Snapshots.
- **Alta Disponibilidade:** Configuração de cluster e replicação via DRBD.

## 🏗️ Estrutura do Sistema

O projeto adota uma arquitetura simplificada e robusta utilizando Next.js como uma plataforma unificada (Full Stack). Não há separação complexa entre "frontend" e "backend" tradicional; a API é integrada e type-safe.

| Componente | Tecnologia | Responsabilidade |
|------------|------------|------------------|
| **Full Stack** | Next.js 14+ | Renderização UI (Server/Client Components) e API Layer |
| **API Type-Safe** | tRPC | Comunicação cliente-servidor com validação Zod |
| **Sistema** | TypeScript / Shell | Interação segura com o kernel Linux (ZFS, DRBD) |

## 🔗 Navegação Rápida

- **Arquitetura Técnica:** [Decisões de Arquitetura](./architecture.md)
- **Documentação de Contexto:** [Project Context](../project-context.md)
- **Épicos & Histórias:** [Epics](./epics.md)
- **Desenvolvimento:** [Guia de Workflow](./development/workflow-greenfield-guide.md)

## 📊 Stack Tecnológico

![Tech Stack](https://skillicons.dev/icons?i=nextjs,ts,react,tailwind,linux,debian&perline=6)

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn UI
- **Estado do Servidor:** React Query (via tRPC)
- **Sistema Operacional:** Debian 13 (Trixie)
