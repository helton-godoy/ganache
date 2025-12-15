---
title: "Deployment Guide - GANACHE"
category: "deployment-guide"
project_type: "ops"
created: "2025-12-14"
updated: "2025-12-14"
author: "BMAD Analyst Agent"
status: "draft"
version: "0.1.0"
tags: ["ganache", "deployment", "installation", "debian", "iso"]
related_docs: ["docs/handoff/handoff-technical-specs.md"]
bmad_compliance: true
---

# 🚀 Guia de Implantação: Ganache Enterprise NAS

Este guia descreve os procedimentos para instalação e configuração inicial do Ganache, cobrindo tanto a instalação "Bare Metal" quanto a instalação sobre um sistema Debian 13 "Bookworm" existente.

## 1. Pré-requisitos de Sistema

### Hardware Mínimo

* **CPU:** 64-bit (x86_64), dual-core.
* **RAM:** 8GB (Recomendado 16GB+ para ZFS ARC).
* **Boot Drive:** SSD dedicado (32GB+).
* **Data Drives:**
  * *Modo Legado:* Configurados via Controller BIOS como RAID Hardware.
  * *Modo Nativo:* Configurados via Controller BIOS como JBOD/Passthrough.

### Rede

* **Interface de Gerenciamento:** 1GbE mínimo.
* **Interface de Replicação (Cluster HA):** Link dedicado (crossover ou VLAN isolada) recomendado para DRBD.

---

## 2. Cenários de Instalação

### Cenário A: Instalação via ISO (Recomendado)

*Em breve: O Ganache fornecerá uma ISO customizada baseada no instalador do Debian/Proxmox.*

1. Boot via USB/ISO.
2. Selecionar "Install Ganache NAS".
3. O instalador particionará o disco de boot (ext4/xfs) e instalará o sistema base.
4. Após o reboot, o `ganache-wizard` estará disponível na porta 8006 (HTTPS).

### Cenário B: Instalação sobre Debian 13 (Bookworm)

Se você já possui um servidor Debian instalado:

1. **Adicionar Repositório Ganache:**

    ```bash
    echo "deb https://apt.ganache.nas/bookworm main" > /etc/apt/sources.list.d/ganache.list
    wget -qO - https://apt.ganache.nas/key.asc | apt-key add -
    ```

2. **Instalar Pacotes Principais:**

    ```bash
    apt update
    apt install ganache-backend ganache-ui zfs-dkms drbd-utils pacemake corosync
    ```

    *(Nota: A instalação instalará dependências de kernel como headers e módulos DRBD/ZFS)*

3. **Pós-Instalação:**
    Verifique se os serviços estão rodando:

    ```bash
    systemctl status ganache-api
    ```

---

## 3. Configuração Inicial (First Boot)

Ao acessar a interface web (`https://<IP>:8006/`) pela primeira vez:

1. **Hardware Scan:** O sistema apresentará o hardware detectado.
2. **Mode Selection:** O sistema sugerirá "Legacy HA" ou "Native ZFS".
3. **Network Setup:** Configuração de IPs estáticos e Bond (LACP) se disponível.
4. **Cluster Join (Opcional):** Se este for o segundo nó, cole o token de junção do primeiro nó para configurar o HA automaticamente.

## 4. Solução de Problemas Comuns

* **Erro: "DRBD module not loaded"**
  * Verifique se o Secure Boot está bloqueando módulos não assinados (DKMS).
  * Solução: Desabilitar Secure Boot ou assinar módulos localmente.

* **Erro: "ZFS Pool import failed" no boot**
  * Verifique a ordem de boot do Systemd ou configurações do Pacemaker se estiver em modo HA.
