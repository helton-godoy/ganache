---
stepsCompleted: []
inputDocuments: []
session_topic: 'UX do Setup Dual-Mode'
session_goals: 'Simplificar a complexidade de Legacy vs Native para o usuário final'
selected_approach: 'ai-recommended'
techniques_used: ['Constraint Mapping', 'Persona Journey', 'Decision Tree Mapping']
stepsCompleted: [1, 2, 3, 4]
ideas_generated: ['Constraint Mapping', 'Hardware Gates', 'Transparency Tone', 'Cluster Decision Flow']
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Helton
**Date:** 2025-12-14

## Session Overview

**Topic:** UX do Setup Dual-Mode
**Goals:** Simplificar a complexidade de Legacy vs Native para o usuário final

### Context Guidance

O projeto Ganache possui um requisito complexo de suportar hardware legado (Legacy Mode com DRBD) e moderno (Native Mode com ZFS puro). A complexidade técnica não deve ser repassada ao usuário final. O objetivo é criar uma experiência de setup que guie o usuário de forma transparente e segura, evitando erros críticos (Safety Gates) e configurando o sistema corretamente para o hardware detectado.

### Session Setup

Focaremos em como transformar a detecção técnica de hardware e as restrições de arquitetura em uma jornada de usuário fluida e amigável.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** UX do Setup Dual-Mode with focus on Simplificar a complexidade de Legacy vs Native

**Recommended Techniques:**

- **Constraint Mapping (Deep):** Mapear restrições técnicas inegociáveis (Safety Gates) para base do Wizard.
- **Persona Journey (Theatrical):** Simular a experiência de um Admin Júnior para identificar fricção.
- **Decision Tree Mapping (Structured):** Desenhar o fluxo lógico ideal de decisão automática.

**AI Rationale:** Combinamos análise técnica profunda (para segurança) com empatia de usuário (para UX) e estruturação lógica (para implementação), cobrindo todos os aspectos do problema.

## Technique Execution Results

### 1. Constraint Mapping

**Objetivo:** Mapear Safety Gates técnicos que o Wizard deve respeitar.

- **Critical Safety Gates Detectados:**
  - **Hardware Controller:**
    - PERC 6/i (ou similar) -> Força **Legacy Mode**.
    - HBA IT Mode -> Permite **Native Mode**.
  - **Disk Visibility:**
    - Discos Lógicos (RAID Layer) -> Proíbe ZFS Native (risco de corrupção).
    - Discos Físicos (JBOD) -> Requisito para ZFS Native.
  - **Kernel Module:**
    - Presença de `/proc/drbd` -> Indicativo de Legacy/Cluster stack instalada.

- **UX Implications (The "Walls"):**
  - **Stop-Gate:** Se hardware incompatível for detectado para a escolha do usuário, o sistema deve **bloquear** o avanço, não apenas avisar.
  - **Auto-Selection:** O sistema deve pré-selecionar o modo baseado no hardware, removendo a carga cognitiva do usuário (ex: se RAID card detectada, nem mostra opção ZFS Native ou a mostra desabilitada com explicação).

### 2. Persona Journey

**Objetivo:** Reduzir a ansiedade do "Admin Júnior" através de comunicação clara.

- **Tone Strategy:** "Transparência Guiada" ou "Transparency with Recommendation".
- **Key Insight:** O usuário precisa saber *por que* uma opção foi escolhida, mas não quer ter que tomar a decisão técnica difícil sozinho.
- **Winning Phrasing:** `(**Atenção** dispositivo identificado: **"RAID Controller"**. Configuração recomendada: _Modo Compatibilidade_)`
  - **Why it works:** Valida o hardware (o sistema "viu" o que eu tenho) e dá a solução segura imediatamente.
  - **Empathy Check:** Remove o medo de "escolher errado" ao apresentar a recomendação como consequência lógica do hardware detectado.

### 3. Decision Tree Mapping

**Objetivo:** Definir o fluxo lógico para configuração de Cluster no Wizard.

- **Proposed Flow (Cluster Decision):**
  - **Step 1:** Pergunta explícita "Configurar um cluster agora?".
  - **Branch Yes:**
    - Solicita Role: `[ ] Servidor Principal` vs `[ ] Servidor Secundário`.
    - Inicia discovery/handshake imediato (não deixa ponta solta).
  - **Branch No:**
    - Feedback claro: `> Retome esta configuração navegando até o **Painel de Configuração**.`
    - Segue para setup Standalone (Legacy Mode sem peer ativo no momento).
- **Rationale:** Dá controle ao usuário mas educa sobre onde encontrar a opção depois. Evita "truque de mágica" de auto-discovery que pode falhar em redes complexas. Traz clareza sobre o papel do nó (Primary/Secondary) desde o início.

## Idea Organization and Prioritization

**Thematic Organization:**

1. **Segurança Técnica (The Walls):** Hardware Scan e Safety Gates inegociáveis.
    - *Insight:* O sistema deve proteger o usuário de configurações inválidas (Hardware Mismatch).
2. **Comunicação Empática (The Guide):** "Transparency with Recommendation" para reduzir ansiedade.
    - *Insight:* Explicar o "porquê" da recomendação gera confiança e remove o medo de erro.
3. **Fluxo de Decisão (The Path):** Árvore lógica clara para Cluster vs Standalone.
    - *Insight:* Perguntas explícitas sobre Role (Primary/Secondary) evitam ambiguidade técnica.

**Prioritization Results:**

- **Top Priority (Must Have):** Implementação dos Safety Gates no Backend (System Integration) e Wizard Step 1 com Recomendaçõ Automática.
- **Quick Win:** Refatoração dos textos do Wizard usando o tom "Admin Júnior friendly".
- **Strategic (Should Have):** Lógica de Cluster Setup com discovery explícito após seleção de Role.

**Action Planning:**

1. **Backend Engineering:**
    - Criar struct `HardwareCapabilities` e lógica de scan.
    - Implementar bloqueio de ZFS Native em hardware RAID.
2. **Frontend/UX:**
    - Prototipar Wizard Step 1 com a mensagem de "Recomendação".
    - Implementar fluxo de decisão de Cluster "Sim/Não -> Role".

## Session Summary and Insights

**Key Achievements:**

- Transformamos um problema técnico complexo (Dual Mode) em uma jornada de usuário guiada.
- Definimos barreiras de segurança claras para evitar erro humano.
- Criamos um tom de voz que educa e tranquiliza o usuário.

**Session Reflections:**
O uso da técnica *Persona Journey* foi crucial para identificar que a transparência sobre *o motivo* da recomendação é o que gera a sensação de segurança no usuário, mais do que a automação invisível ("magic").

---
**Status:** ✅ Finalizado
**Próximo Workflow:** `product-brief` ou `prd` (para formalizar estes requisitos).
