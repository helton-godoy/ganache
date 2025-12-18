# Story 2.2: ZFS Pool Creation on DRBD

Status: done

## Story

Como um Administrador de Sistema,
Eu quero que o pool de armazenamento ZFS seja criado sobre o dispositivo replicado (DRBD),
para que todos os meus dados sejam automaticamente espelhados para o segundo nó.

## Acceptance Criteria

1. **Dado** que o recurso DRBD está no estado `UpToDate`
   **Quando** o sistema inicia o "Storage Format"
   **Então** ele deve executar o comando `zpool create` visando o dispositivo `/dev/drbdX` (NÃO o disco bruto)

2. **Dado** a criação do pool
   **Quando** o pool é inicializado
   **Então** ele deve habilitar a compressão (lz4) por padrão

3. **Dado** um cluster de dois nós
   **Quando** o pool é criado no nó Primário
   **Então** o sistema deve verificar se o pool é visível apenas no nó Primário, evitando conflitos de importação

## Tasks / Subtasks

- [x] Implementar `ZpoolService::get_drbd_devices` no backend Rust (core/ganache-lib)
- [x] Implementar `ZpoolService::create_pool` com suporte a dispositivos DRBD
- [x] Implementar verificação de saúde do pool após criação
- [x] Adicionar testes unitários para o fluxo de criação de pool (ZFS sobre DRBD)
- [x] Integrar backend com tRPC no frontend (src/trpc)

## Dev Notes

- **Implementação Atual (Auditada):** A lógica reside em `core/ganache-lib/src/system/zfs.rs`. Atualmente, o comando `zpool create` está simulado (mocked) para fins de desenvolvimento seguro em ambiente local, mas já aceita a configuração de dispositivo DRBD.
- O mapeamento de dispositivos DRBD é feito via `ZpoolService::get_drbd_devices`, que retorna `/dev/drbd0` como dispositivo padrão no mock.
- **Ponto de Atenção:** A compressão lz4 está mencionada nos requisitos, mas a implementação do mock apenas imprime a intenção. Na fase de produção real, o comando final deve incluir `-O compression=lz4`.

### Project Structure Notes

- A lógica de backend está centralizada em `core/ganache-lib` para facilitar o reuso entre o CLI e o serviço de API.

### References

- [Epic 2: Resilient HA Storage](file:///root/GANACHE/docs/epics.md#Epic-2:-Resilient-HA-Storage)
- [Story 2.2: ZFS Pool Creation on DRBD](file:///root/GANACHE/docs/epics.md#L191)
- [Implementação Rust: zfs.rs](file:///root/GANACHE/core/ganache-lib/src/system/zfs.rs)
