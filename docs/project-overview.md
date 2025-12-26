# Visão Geral do Projeto GANACHE

## Propósito

O GANACHE é um Appliance de Storage de alta disponibilidade que implementa uma "Arquitetura Pragmática" para rodar ZFS sobre dispositivos de Hardware RAID sem suporte a Passthrough/HBA.

## Pilha de Tecnologia

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Rust, Axum, Tokio
- **Banco de Dados:** ZFS, DRBD
- **Infraestrutura:** Debian, Docker, Kubernetes

## Estrutura do Repositório

Monorepo com duas partes principais:

- Frontend (src/): Interface web baseada em Next.js
- Backend (core/): API e serviços do sistema em Rust

## Estado Atual

- Epics: 5 completadas (Trustable Appliance Core, Resilient HA Storage, Config Time-Machine, Enterprise Integration, Compliance Shield)
- Histórias: Desenvolvimento ativo, com foco em Epic 5 (Compliance Shield)
- Documentação: Seguindo padrões BMAD v6

## Equipe e Processo

- Metodologia: BMAD-METHOD para desenvolvimento ágil e documentado
- Agentes: Sm (Scrum Master), Dev (Desenvolvedor), Architect (Arquiteto), etc.
- Controle de Qualidade: Testes automatizados, revisões de código, validação de histórias

## Roadmap

- Epic 6: Melhorias de Processo e Qualidade
- Foco: Otimização de processos, robustez técnica, documentação aprimorada
