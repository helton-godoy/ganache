---
title: "API Documentation - GANACHE"
category: "api-reference"
project_type: "web+backend"
created: "2025-12-14"
updated: "2025-12-14"
author: "BMAD Analyst Agent"
status: "approved"
version: "1.0.0"
tags: ["ganache", "api", "openapi", "rest", "backend"]
related_docs: ["docs/technical-specs.md", "docs/api-contracts-backend.md"]
bmad_compliance: true
---

# 📡 Documentação da API do Ganache

Este documento centraliza as referências para a API REST do Ganache Enterprise NAS. A comunicação entre o Frontend (React) e o Backend (Rust) é estritamente tipada e baseada em contratos OpenAPI.

## 1. Especificação OpenAPI (Swagger)

A fonte da verdade para todos os endpoints é o arquivo de especificação OpenAPI.

* **Localização no Repositório:** `ganache/api-spec.yaml`
* **Versão Atual:** v1.1
* **Visualização:** Utilize o Swagger UI ou Redoc para visualizar este arquivo.

## 2. Contratos & Tipagem

### Backend (Rust/Axum)

* **Definição:** As rotas e DTOs são validados em tempo de compilação.
* **Documentação Auxiliar:** [API Contracts Backend](docs/api-contracts-backend.md)

### Frontend (TypeScript)

* O cliente da API é gerado automaticamente a partir do `api-spec.yaml` usando `openapi-fetch`.
* **NÃO modifique os tipos manualmente.** Se precisar alterar um endpoint, altere a spec e gere o cliente novamente.

## 3. Endpoints Críticos (Destaques)

### 3.1. Cluster Management

* `POST /api/v1/cluster/join` - Adiciona este nó a um cluster existente.
* `POST /api/v1/cluster/drbd/resolve-split-brain` - Recuperação de desastres (Requer tokens de segurança).

### 3.2. Hardware & Storage

* `GET /api/v1/hardware/scan` - Retorna capacidades brutas do hardware.
* `POST /api/v1/storage/pool` - Cria pools ZFS (O backend decide a estratégia Legacy/Native baseado nos parâmetros e hardware).

## 4. Autenticação

Todos os endpoints (exceto `/login` e `/ping`) requerem autenticação via JWT (JSON Web Token) no Header Authorization.

```http
Authorization: Bearer <token>
```
