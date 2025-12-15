---
title: "Technical Specifications - GANACHE"
category: "technical-specifications"
project_type: "backend"
created: "2025-12-14"
updated: "2025-12-14"
author: "BMAD Analyst Agent"
status: "draft"
version: "0.1.0"
tags: ["ganache", "specs", "rust", "storage-trait", "zfs", "drbd"]
related_docs: ["docs/architecture/architecture-backend.md", "docs/api-contracts-backend.md"]
bmad_compliance: true
---

# 🛠️ Especificação Técnica: Ganache Storage Architecture

Este documento detalha as especificações técnicas para a implementação da camada de armazenamento do Ganache, focando no padrão "Dual Mode Strategy" para suporte a hardware legado e moderno.

## 1. StorageTrait & Strategy Pattern

A abstração central do sistema é a `StorageTrait`, que define o contrato unificado para operações de armazenamento, independentemente do backend físico subjacente.

### 1.1. Definição da Trait (Rust)

```rust
/// Define o comportamento abstrato para backends de armazenamento.
///
/// Implementações:
/// - `LegacyStorage`: ZFS sobre DRBD sobre LVM sobre Hardware RAID.
/// - `NativeStorage`: ZFS Nativo (RaidZ/Mirror) sobre HBA/JBOD.
#[async_trait]
pub trait StorageTrait: Send + Sync {
    /// Inicializa o subsistema de armazenamento.
    /// Retorna erro se o hardware detectado for incompatível com a implementação.
    async fn initialize(&self) -> Result<()>;

    /// cria um novo pool ZFS com a topologia especificada.
    /// No modo Legacy, a topologia é restrita (ex: single vdev).
    async fn create_pool(&self, name: &str, topology: Topology) -> Result<()>;

    /// Importa um pool existente.
    async fn import_pool(&self, name: &str) -> Result<()>;

    /// Retorna o status de saúde do armazenamento.
    /// Inclui status do DRBD (se aplicável), RAID (se possível) e ZFS.
    async fn get_health(&self) -> Result<StorageHealth>;

    /// Verifica se o nó atual possui o Quorum/Lock para montar o pool.
    async fn has_quorum(&self) -> bool;
}
```

### 1.2. Implementações

#### A. LegacyStorage (Modo Compatibilidade)

* **Target Hardware:** Dell PowerEdge 2950 (PERC 6/i) ou similar.
* **Safety Gate:**
  * Deve verificar a presença de dispositivos DRBD configurados (`/proc/drbd`).
  * **CRÍTICO:** `initialize()` deve falhar se detectar HBA capaz de ZFS nativo para evitar uso acidental do modo legado em hardware moderno.
* **Fencing:** Integração obrigatória com Pacemaker/Corosync API para garantir exclusivo acesso ao recurso DRBD antes de montar o ZFS.

#### B. NativeStorage (Modo Moderno)

* **Target Hardware:** Servidores modernos com HBA (IT Mode).
* **Safety Gate:**
  * `initialize()` deve falhar se detectar volumes lógicos ou controladoras RAID mascarando discos.
  * Deve exigir acesso direto aos dispositivos de bloco (`/dev/disk/by-id/*`).

---

## 2. Protocolo de Recuperação & Segurança (Split-Brain)

Especificação dos endpoints e lógica para recuperação de desastres no Cluster HA.

### 2.1. API Endpoints

#### `POST /api/v1/cluster/drbd/resolve-split-brain`

Endpoint administrativo para forçar a resolução de divergência de dados.

* **Request Payload:**

    ```json
    {
      "strategy": "discard-younger-primary" | "discard-older-primary",
      "confirm_data_loss": true,
      "confirmation_token": "a1b2-c3d4" // Token OTP ou desafio gerado previamente
    }
    ```

* **Lógica de Segurança (Two-Step Verification):**
    1. Admin solicita resolução.
    2. Sistema retorna `402 Payment Required` (metaforicamente) ou `428 Precondition Required` com um `challenge_id`.
    3. Admin reenvia request com o `confirmation_token` assinado para provar intenção humana.

### 2.2. Safety Gates Nativos

* **Hardware Watchdog:** O serviço `ganache-backend` deve alimentar o hardware watchdog (`/dev/watchdog`). Se o processo travar ou detectar inconsistência grave no ZFS, o nó deve reiniciar para liberar o recurso HA.

---

## 3. Hardware Discovery (Auto-Detection)

O Frontend (React Wizard) depende dessa especificação para guiar o usuário.

### 3.1. Struct `HardwareCapabilities`

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct HardwareCapabilities {
    /// Verdadeiro se detectarmos controladoras RAID de hardware conhecidas (PERC, MegaRAID).
    pub has_hardware_raid: bool,
    
    /// Lista de discos "limpos" visíveis para ZFS Nativo.
    pub zfs_compatible_disks: Vec<DiskInfo>,
    
    /// Verdadeiro se o DRBD estiver instalado e configurado no kernel.
    pub drbd_available: bool,
    
    /// Modo recomendado baseado na varredura.
    pub recommended_mode: StorageMode, // Legacy | Native
}
```

### 3.2. Fluxo de Instalação (Wizard)

1. **Step 1:** Backend roda scan de hardware na inicialização.
2. **Step 2:** Frontend consome `GET /api/v1/hardware/capabilities`.
3. **Step 3:**
    * Se `recommended_mode == Legacy`: UI esconde opções de RaidZ avançado e foca na configuração do Cluster IP/DRBD.
    * Se `recommended_mode == Native`: UI foca na seleção de discos para criação do Pool ZFS.
