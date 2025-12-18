---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments: 
  - '/root/GANACHE/docs/analysis/product-brief-GANACHE-2025-12-14.md'
  - '/root/GANACHE/docs/analysis/brainstorming-session-2025-12-14.md'
  - '/root/GANACHE/docs/index.md'
  - '/root/GANACHE/docs/project-overview-ganache.md'
  - '/root/GANACHE/docs/architecture/source-tree-analysis.md'
  - '/root/GANACHE/docs/architecture/architecture-backend.md'
  - '/root/GANACHE/docs/architecture/architecture-frontend.md'
  - '/root/GANACHE/docs/architecture/integration-architecture.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 6
workflowType: 'prd'
lastStep: 1
project_name: 'GANACHE'
user_name: 'Helton'
date: '2025-12-14'
---

# Product Requirements Document (PRD) - GANACHE

**Author:** Helton
**Status:** Approved (BMAD 6 SSoT)

## Executive Summary

**Ganache NAS** is a specialized High-Availability Storage Appliance built to solve a critical infrastructure paradox: running modern ZFS-based workloads on legacy enterprise hardware (e.g., Dell PowerEdge 2950 with PERC 6/i) that lacks HBA/Passthrough modules.

Ganache implements a **"Pragmatic Architecture"**: it layers ZFS over DRBD (Distributed Replicated Block Device) on top of Hardware RAID volumes. This architecture recovers data safety via synchronous block-level replication and external backup integration.

* **API Pattern:** Type-Safe **OpenAPI / REST** (Next.js + Rust) ensuring separation of concerns and robust contract-first development.

## Project Scoping & Phased Development

### MVP Strategy: The "Trustable Appliance"

**Philosophy:** A "Problem-Solving MVP" that prioritizes data safety and compliance.
**Key Architectural Pivot:** Configuration State is managed via a **Git-Driven Backend** and a high-performance **Rust Daemon** for system operations.

### Phase 1: The "Ganache Appliance" (MVP / v1.0)

- **Infrastructure:** ZFS over DRBD 9 (2-Node HA) on PERC 6/i.
* **Access:** SMB Shares with Active Directory Integration.
* **Governance:** Git-Backed Config for all system state.

## Core Requirements (Requisitos Core)

### Functional Requirements (FR)

- **FR1:** Wizard de instalação inteligente para configuração ZFS-over-DRBD.
* **FR2:** Auto-tuning do ZFS ARC baseado na RAM detectada.
* **FR5:** Aplicação de Quota Rígida de 90% para prevenir travamento CoW.
* **FR7:** Registro de toda mudança de configuração via Git Commits.

### Non-Functional Requirements (NFR)

- **NFR1:** Saturação de link 1GbE (110MB/s) em escritas sequenciais.
* **NFR4:** Tempo de failover (RTO) inferior a 30 segundos.
* **NFR6:** Logs de auditoria imutáveis.

## Project Classification

- **Technical Type:** Infrastructure Appliance (Next.js + Rust)
* **Domain:** Enterprise Storage / High Availability
* **Complexity:** High (Kernel-level interactions, Cluster State)

---
*Este documento é a Fonte Única de Verdade para requisitos do projeto GANACHE.*
