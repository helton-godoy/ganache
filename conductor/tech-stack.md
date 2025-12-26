# Projeto Ganache - Documentação Técnica e Arquitetural

## Sumário Executivo

O **Ganache** é uma plataforma de NAS Enterprise de Alta Disponibilidade (HA), desenvolvida como um _remaster_ do **Proxmox Backup Server (PBS)**. O objetivo é fornecer gestão de armazenamento SMB/NFS robusta, utilizando a base sólida do Debian 13 e Rust.

---

## 1. Visão Geral do Projeto

### 1.1 Definição do Produto

Ganache deve ser um servidor **NAS HA (DRBD+ZFS+Samba)** construído sobre a **base do Proxmox Backup Server (PBS)**, utilizando os mecanismos nativos do PBS para enviar o conteúdo do NAS para um repositório PBS "puro" externo.

Isso significa que o Ganache atua como um "cliente" de backup especializado (um nó Proxmox) para o seu próprio conteúdo de armazenamento (o ZFS Pool onde reside o Samba).

### 1.2 Stack Tecnológico

- **Backend:** Rust (Baseado no `proxmox-backup`). Foco em tipagem forte para evitar estados inválidos de cluster.
- **Frontend:** React + TypeScript (Consumindo OpenAPI Contract).
- **Protocolo de Recuperação:** Endpoints de API específicos para resolução de _Split-Brain_ (divergência de dados no DRBD), com travas de segurança (`confirm_data_loss`).

---

## 2. O Desafio de Hardware (O "Why")

O projeto nasce para atender servidores legados (ex: Dell PowerEdge 2950) com controladoras RAID de Hardware (PERC 6/i) que **não suportam modo HBA/JBOD**.

- **Conflito:** O ZFS nativo exige acesso direto aos discos, o que a controladora impede.
- **Solução:** Uma arquitetura híbrida que permite o uso de ZFS mesmo sobre RAID de hardware, delegando a redundância de disco para a controladora e a redundância de nó para o DRBD.

---

## 3. Arquitetura de Software: "Dual Mode Strategy"

Para suportar tanto o hardware legado quanto hardware moderno, o Backend (Rust) implementa um **Strategy Pattern** através de uma `StorageTrait`:

### 3.1 Modo A: Legacy HA (Compatibilidade)

- **Pilha:** RAID 10 (Hardware) → Volume Lógico → **DRBD** (Replicação via Rede) → **ZFS** (Camada Lógica).
- **Funcionamento:** O ZFS é formatado sobre o dispositivo `/dev/drbd0`. A integridade dos dados depende do DRBD (sincronia entre nós) e do RAID (discos físicos).
- **Orquestração:** Pacemaker/Corosync gerenciam quem monta o ZFS (Ativo/Passivo).
- **Segurança:** Implementação de lógica de "Safety Gate" que impede o ZFS Nativo se detectar controladora RAID.

### 3.2 Modo B: Native ZFS (Moderno)

- **Pilha:** HBA/JBOD → **ZFS** (RaidZ/Mirror nativo).
- **Funcionamento:** O ZFS gerencia diretamente a integridade física e lógica dos discos.

---

## 4. Estratégia de Backup NAS → PBS (Ganache → PBS Puro)

O Ganache utiliza sua própria infraestrutura NAS (ZFS) e, em seguida, age como um **cliente Proxmox** que envia cópias de segurança incrementais para um repositório PBS externo (o "PBS puro"), usando os recursos de segurança e eficiência do PBS.

### 4.1 Fluxo do Backup de Conteúdo NAS (Samba)

1. **Geração de Snapshot ZFS:** Rotinas programadas (cron jobs) criam _snapshots_ do _dataset_ Samba no pool ZFS do Ganache.

2. **Preparação do Stream:** O processo de backup no Ganache acessa o _snapshot_ ZFS.

3. **Transporte Eficiente:** O Ganache (atuando como cliente Proxmox) utiliza mecanismos de transporte eficientes, como o comando `zfs send` incremental, que pode ser encapsulado pelo **proxmox-backup-client** ou `vzdump` para ser enviado ao PBS Puro.

4. **Recursos PBS Utilizados:** Este transporte tira proveito dos recursos avançados do PBS, como **backups incrementais**, **deduplicação de dados em chunk a nível de bloco**, e **criptografia cliente-lado**.

5. **Armazenamento Remoto:** O PBS Puro recebe o _stream_ e armazena os dados no seu _datastore_ deduplicado e seguro.

O objetivo é, portanto, não usar o recurso de "sincronização remota" (que é para redundância de datastore), mas sim a **função de backup (cliente)** para proteger os dados da fonte (ZFS/Samba).

---

## 5. Governança e Segurança NAS

A segurança do NAS (permissões de acesso a arquivos) é garantida por:

- **Controle de Acesso Baseado em Papéis (RBAC):** O Ganache deve implementar o RBAC nativo do Proxmox (`pveum`) para gerenciar usuários, grupos e permissões, permitindo controle granular sobre o acesso aos recursos (`/storage`, `/nodes`).

- **Integração AD/Samba:** O Samba é integrado ao Active Directory (AD) para gerenciar as ACLs de usuários.

---

## 6. Implementação Técnica: Integração com Active Directory

### 6.1 Estratégia de Referência

O **TrueNAS Scale** é o "padrão ouro" para NAS em Linux (Debian), e o **Proxmox Backup Server (PBS)** também corre sobre Debian.

No entanto, há um desafio importante aqui: **A linguagem.**

- O TrueNAS Scale (Middleware) é escrito maioritariamente em **Python**.
- O PBS é escrito em **Rust**.

Não podemos simplesmente "copiar e colar" o código. O que vamos fazer é **extrair a lógica de negócio** (como eles geram o `smb.conf`, como lidam com as ACLs) e traduzir essa lógica para Rust.

### 6.2 Mapa do Tesouro (Repositórios Oficiais)

O "cérebro" do TrueNAS Scale não está no kernel, mas sim no **Middleware**. É aqui que eles definem as regras para o Samba, AD e ZFS.

- **Repositório Principal:** `https://github.com/truenas/middleware`
- **Onde está o Samba:** `src/middlewared/middlewared/plugins/smb.py` (e pasta `smb_configure`).
- **Onde está o Active Directory:** `src/middlewared/middlewared/plugins/activedirectory.py`.
- **Onde estão as ACLs/Permissões:** `src/middlewared/middlewared/plugins/filesystem.py` (e utilitários relacionados a `nfs4xdr`).

### 6.3 Estratégia de "Engenharia Reversa"

Como o TrueNAS usa **NFSv4 ACLs** sobre ZFS para garantir compatibilidade perfeita com o Windows (o Windows não entende bem as permissões POSIX tradicionais do Linux), precisamos configurar o ZFS do PBS da mesma forma.

#### Passo A: ZFS e ACLs (A Base)

O PBS já tem suporte a ZFS (é nativo!), mas para funcionar como o TrueNAS e ser amigo do Windows, o dataset ZFS precisa de flags específicas.

- **Segredo do TrueNAS:** Eles usam `acltype=nfsv4` (ou `posixacl` em versões mais antigas com camadas de tradução) e `xattr=sa` (para performance).

#### Passo B: Samba e Active Directory

O TrueNAS usa o **winbind** para falar com o AD. O PBS vai precisar dos pacotes `samba`, `winbind`, e `smbclient`.

### 6.4 Exemplo Prático de Implementação

**Instrução Técnica para o Agente:**

> "Agente, vamos aprimorar o nosso gerador de configuração Samba (`src/api2/config/samba.rs`).
>
> **Requisito Técnico:**
> Para compatibilidade com Windows (semelhante ao TrueNAS Scale), a secção `[global]` do arquivo `smb.conf` gerado precisa de incluir obrigatoriamente:
>
> 1. `vfs objects = acl_xattr`
> 2. `map acl inherit = yes`
> 3. `store dos attributes = yes`
>
> **Tarefa:**
> Atualiza a função que gera a string de configuração para incluir estes parâmetros hardcoded no topo do arquivo."

### 6.5 Pacote de Links para o Active Directory (Samba + Winbind)

Para a integração com AD, o TrueNAS usa uma ferramenta chamada `net ads join`. No PBS, teremos de implementar uma chamada de sistema (via `std::process::Command` em Rust) para fazer isso.

O arquivo que deve consultar para ver como eles fazem a validação é:

- `src/middlewared/middlewared/plugins/activedirectory.py` (Procura por `do_join`).

---

## 7. Estado Atual do Desenvolvimento

- **Documentação:** Arquitetura C4, Especificação OpenAPI (v1.1) e Backlog de Épicos definidos.
- **Próximos Passos:** Implementação da `StorageTrait` em Rust e construção do Wizard de Instalação no React que detecta o hardware automaticamente.

---

## 8. Melhorias Implementadas nesta Versão

1. **Flexibilidade do ZFS:** Deixei explícito que o ZFS é a camada de _Filesystem_ em **ambos** os modos. Antes, poderia parecer que o modo legado usava outro FS. Agora está claro: é ZFS sobre DRBD (Legado) ou ZFS sobre Disco (Nativo).
2. **Strategy Pattern:** Enfatizei que a solução técnica é via software (Rust Traits), o que profissionaliza o código e evita "gambiarras" de scripts soltos.

---

## 9. Apêndice: Referências e Links

### 9.1 Repositórios Oficiais

- **TrueNAS Middleware:** <https://github.com/truenas/middleware>
- **Proxmox Backup Server:** <https://github.com/proxmox/proxmox-backup>

### 9.2 Arquivos Chave para Referência

- `src/middlewared/middlewared/plugins/smb.py`
- `src/middlewared/middlewared/plugins/activedirectory.py`
- `src/middlewared/middlewared/plugins/filesystem.py`

### 9.3 Comandos e Ferramentas

- `net ads join` - Para integração com Active Directory
- `zfs send` - Para transporte eficiente de snapshots
- `proxmox-backup-client` - Cliente de backup do Proxmox
