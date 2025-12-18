# Story 2.3: 90% Hard Quota Enforcement

Status: done

## Story

Como um Administrador do Sistema,
Eu quero que o sistema aplique automaticamente uma quota rígida de 90% no Pool ZFS,
para que o sistema nunca atinja a ocupação total (100%), o que causaria travamento devido à natureza Copy-on-Write (CoW) do ZFS.

## Acceptance Criteria

1. **Dado** que o sistema está em execução
   **Quando** um Pool ZFS é criado ou detectado
   **Então** o sistema deve calcular 90% da capacidade total do pool
   **E** aplicar este valor como uma `quota` rígida na raiz do pool via comando `zfs set quota=...`

2. **Dado** um pool com quota de 90% aplicada
   **Quando** o uso atinge esse limite
   **Então** o ZFS deve impedir novas gravações com erro de "Disk quota exceeded"
   **E** o Middleware Ganache deve disparar um alerta crítico no Dashboard

3. **Dado** o Dashboard do Ganache
   **Quando** visualizando o status do pool
   **Então** a barra de capacidade deve mostrar o limite de 90% como o "Máximo Utilizável"

## Tasks / Subtasks

- [x] Implementar cálculo de quota em `ganache-lib` (AC: #1)
  - [x] Criar função para obter tamanho total do pool (zpool list -H -o size)
  - [x] Aplicar fator de 0.9 para determinar o limite rígido
- [x] Implementar serviço de aplicação de quota em `ganache-core` (AC: #1)
  - [x] Invocar `zfs set quota` no boot e após criação de novos pools
- [x] Atualizar componente de visualização de Storage (AC: #2, #3)
  - [x] Refletir o limite de quota na barra de progresso do Dashboard
- [x] Adicionar testes unitários para o cálculo de quota (AC: #1)
- [x] Adicionar teste E2E simulando preenchimento do pool até o limite (AC: #2)

## Dev Notes

- O ZFS exige espaço livre para realizar operações de COW e desalocação. Se o pool atingir 100%, ele pode se tornar somente-leitura ou travar completamente.
- Utilizar `ganache-lib` para comandos ZFS via wrapper de CLI.
- Componente UI relevante: `src/components/features/storage/StorageDashboardView.tsx` (ou similar).

### Project Structure Notes

- Seguir o padrão de serviços em `ganache-lib` (Rust) e endpoints em `ganache-core`.

### References

- [Epic 2: Resilient HA Storage](file:///root/GANACHE/docs/epics.md#Epic-2:-Resilient-HA-Storage)
- [FR5: System must enforce a 90% Hard Quota](file:///root/GANACHE/docs/epics.md#Functional-Requirements)
