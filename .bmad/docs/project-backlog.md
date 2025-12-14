# Project Backlog: Ganache (v1.0)

**Foco:** Enterprise NAS para Hardware Legado (Dell 2950/PERC 6i)
**Arquitetura:** Frontend-First, Rust Backend, Strategy Pattern.

---

## 🏔️ Epic 1: Fundação e Contrato (The Bedrock)

**Objetivo:** Estabelecer a "Verdade Única" (API Spec) e o ambiente de desenvolvimento isolado.

### 📜 Story 1.1: Definição do Contrato OpenAPI (Cluster & Storage)

**Como** Arquiteto,
**Quero** um arquivo `openapi.json` cobrindo criação de pools e monitoramento de saúde,
**Para que** Frontend e Backend possam ser desenvolvidos em paralelo sem quebrar compatibilidade.

* **AC1:** Spec deve incluir endpoint `POST /api2/json/storage/pool` com campo `strategy` (enum: `legacy_ha`, `native_zfs`).
* **AC2:** Spec deve incluir `GET /api2/json/cluster/status` retornando estados de DRBD (`SplitBrain`, `Connected`).
* **AC3:** Spec deve incluir `POST /api2/json/cluster/resolve-split-brain`.

### 🏗️ Story 1.2: Setup do Monorepo e Mock Server

**Como** Desenvolvedor (Barry),
**Quero** um repositório configurado com React (Vite) e um Mock Server (MSW),
**Para que** eu possa construir a UI imediatamente simulando cenários de erro do DRBD.

* **AC1:** Estrutura de pastas criada (`ganache-web`, `ganache-server`, `api-spec`).
* **AC2:** `npm run dev` no frontend deve carregar o Mock Service Worker.
* **AC3:** O Mock deve ter um "Chaos Mode" (via toggle) que força a API a retornar status `CRITICAL`.

---

## 🧠 Epic 2: Core Backend Engine (Rust)

**Objetivo:** Implementar a lógica segura que impede o usuário de destruir seus dados.

### 🛡️ Story 2.1: Implementação do "Hardware Safety Gate"

**Como** Sistema (Rust),
**Quero** detectar se estou rodando em uma controladora RAID (PERC),
**Para que** eu possa bloquear operações de ZFS Nativo que causariam corrupção.

* **AC1:** Função `validate_hardware()` deve retornar erro se detectar dispositivos lógicos RAID.
* **AC2:** Endpoint de criação deve retornar `400 Bad Request` se `strategy="native_zfs"` for solicitado em hardware legado.

### ⚙️ Story 2.2: Implementação da "StorageStrategy Trait"

**Como** Arquiteto,
**Quero** uma interface Rust genérica (`StorageStrategy`),
**Para que** possamos plugar drivers diferentes (Legacy vs Modern) sem alterar a API.

* **AC1:** Trait definida com métodos `validate_hardware` e `create_pool`.
* **AC2:** Implementação `LegacyHAStrategy` (stub) criada.
* **AC3:** Implementação `NativeZFSStrategy` (stub) criada.

---

## 🤝 Epic 3: Alta Disponibilidade (Legacy HA Driver)

**Objetivo:** A mágica do DRBD + Pacemaker.

### 🧱 Story 3.1: Orquestração de Criação de Pool (Legacy Mode)

**Como** SysAdmin,
**Quero** que ao criar um pool "Legacy HA", o sistema configure o cluster automaticamente,
**Para que** eu não precise editar arquivos de configuração do DRBD na mão.

* **AC1:** Backend deve gerar arquivo `.res` do DRBD baseado no input.
* **AC2:** Backend deve executar `drbdadm up` e `drbdadm primary`.
* **AC3:** Backend deve formatar ZFS sobre `/dev/drbd/by-res/Nome`.
* **AC4:** Backend deve registrar o recurso no Pacemaker (`pcs resource create`).

### 🚑 Story 3.2: Lógica de Recuperação de Split-Brain

**Como** Operador em Pânico,
**Quero** um botão de "Forçar Recuperação",
**Para que** eu possa resolver divergência de dados e trazer o cluster de volta online.

* **AC1:** Endpoint `/resolve-split-brain` deve colocar Pacemaker em manutenção.
* **AC2:** Deve executar comandos destrutivos do DRBD (`--discard-my-data` ou `--discard-younger-primary`) conforme seleção.
* **AC3:** Deve aguardar o status voltar a `Connected` antes de liberar o cluster.

---

## 🎨 Epic 4: Experiência do Usuário (Frontend)

**Objetivo:** Esconder a complexidade, mas expor o perigo.

### 🧙‍♂️ Story 4.1: Wizard de Criação Inteligente

**Como** Usuário Iniciante,
**Quero** que o sistema recomende o modo correto para meu hardware,
**Para que** eu não escolha ZFS Nativo na minha controladora PERC 6/i por engano.

* **AC1:** Ao abrir o Wizard, consultar hardware. Se PERC detectada -> Bloquear opção "Native ZFS" na UI.
* **AC2:** Exibir alerta visual amarelo explicando a limitação do hardware.
* **AC3:** Pré-selecionar `strategy: legacy_ha`.

### 🚨 Story 4.2: Tela de Bloqueio de Desastre (Red Screen)

**Como** SysAdmin,
**Quero** ser bloqueado de usar o sistema se houver Split-Brain,
**Para que** eu não grave dados em um cluster corrompido.

* **AC1:** Polling de status (`5s`). Se `split_brain_detected: true`, exibir Modal Fullscreen Vermelho.
* **AC2:** O modal deve impedir navegação para outras telas.
* **AC3:** O modal deve oferecer as opções de resolução (Eu sou Mestre vs Eles são Mestre).
