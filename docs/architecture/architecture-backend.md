# Architecture - Ganache Backend

**Parte:** Backend
**Linguagem:** Rust
**Framework:** Actix-web 4.0

## 🏗️ Padrão Arquitetural

O backend segue uma arquitetura **Service-based** simplificada, típica de microsserviços ou agentes de sistema.

### Estrutura de Camadas

1. **Presentation Layer (`routes.rs`):**
    - Define os escopos (`/smb`, `/system`, `/zfs`) e mapeia verbos HTTP para handlers.
    - Responsável apenas pelo roteamento.

2. **Logic Layer (`handlers.rs`):**
    - Contém a lógica de negócio.
    - Processa payloads JSON.
    - Executa ações (atualmente mocks/stubs, mas integrará com chamadas de sistema).
    - Retorna `HttpResponse`.

3. **System Layer (Implícito):**
    - Interação com o SO (ZFS commands, Samba configuration files).

## 🧩 Componentes Chave

- **Server (Actix):** Gerencia o pool de threads e conexões HTTP assíncronas (Tokio runtime).
- **Serialization (Serde):** Garante que os dados JSON de entrada/saída estejam conformes às structs Rust.
- **Error Handling:** Uso de `Result<HttpResponse>` para fluxo controlado de erros.

## 💾 Dados e Persistência

- **Estado Volátil:** Atualmente não há banco de dados relacional.
- **Estado Persistente:** O estado é o próprio sistema de arquivos (configurações Linux, ZFS pools). O backend atua como uma interface para o estado do SO.
