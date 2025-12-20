# Plano do Track: Implementar o "Wizard de Instalação"

## Fase 1: Estrutura Básica e Detecção de Hardware (Frontend)

- [ ] Task: Configurar o ambiente React para o Wizard
  - [ ] Task: Escrever Testes para a configuração inicial do ambiente (Red Phase)
  - [ ] Task: Implementar a configuração inicial do ambiente (Green Phase)
- [ ] Task: Desenvolver o layout base do Wizard (esqueleto)
  - [ ] Task: Escrever Testes para o layout base (Red Phase)
  - [ ] Task: Implementar o layout base do Wizard com Shadcn UI/Tailwind CSS (Green Phase)
- [ ] Task: Integrar com a API de Detecção de Hardware (Mock)
  - [ ] Task: Escrever Testes para a integração da API de hardware (Red Phase)
  - [ ] Task: Implementar a chamada a um mock da API para detecção de hardware e exibição inicial (Green Phase)
- [ ] Task: Conductor - User Manual Verification 'Estrutura Básica e Detecção de Hardware (Frontend)' (Protocol in workflow.md)

## Fase 2: Lógica de Seleção de Modo e UI (Frontend)

- [ ] Task: Desenvolver a lógica para sugerir o modo de operação (Legacy HA vs Native ZFS)
  - [ ] Task: Escrever Testes para a lógica de sugestão de modo (Red Phase)
  - [ ] Task: Implementar a lógica de sugestão baseada na detecção de hardware (Green Phase)
- [ ] Task: Criar os componentes UI para seleção de modo
  - [ ] Task: Escrever Testes para os componentes de seleção de modo (Red Phase)
  - [ ] Task: Implementar os componentes de seleção de modo com descrições claras (Green Phase)
- [ ] Task: Implementar a navegação entre as etapas do Wizard
  - [ ] Task: Escrever Testes para a navegação do Wizard (Red Phase)
  - [ ] Task: Implementar a navegação entre as etapas e a persistência do estado (Green Phase)
- [ ] Task: Conductor - User Manual Verification 'Lógica de Seleção de Modo e UI (Frontend)' (Protocol in workflow.md)

## Fase 3: Configuração e Salvamento (Frontend)

- [ ] Task: Desenvolver os componentes UI para configuração do ZFS/DRBD
  - [ ] Task: Escrever Testes para os componentes de configuração ZFS/DRBD (Red Phase)
  - [ ] Task: Implementar os formulários e campos para configuração (Green Phase)
- [ ] Task: Implementar a lógica para coletar e validar as configurações
  - [ ] Task: Escrever Testes para a lógica de validação de configurações (Red Phase)
  - [ ] Task: Implementar a validação das entradas do usuário (Green Phase)
- [ ] Task: Integrar com a API de Salvamento de Configuração (Mock)
  - [ ] Task: Escrever Testes para a integração da API de salvamento (Red Phase)
  - [ ] Task: Implementar o envio das configurações para um mock da API e feedback de sucesso/erro (Green Phase)
- [ ] Task: Conductor - User Manual Verification 'Configuração e Salvamento (Frontend)' (Protocol in workflow.md)
