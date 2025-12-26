# Especificação do Track: Wizard de Instalação

## Título

Implementar o "Wizard de Instalação" no frontend em React, que detecta o hardware do sistema e guia o usuário na configuração inicial.

## Descrição

Este track tem como objetivo principal desenvolver o frontend do "Wizard de Instalação" para o Ganache Enterprise NAS. O wizard será responsável por detectar o hardware do sistema em que o Ganache está sendo executado e, com base nessa detecção, guiar o usuário na escolha e configuração do modo de operação (Legacy HA ou Native ZFS). A interface deve ser intuitiva e fornecer feedback claro ao usuário durante o processo.

## Objetivos

- Desenvolver a interface de usuário (UI) do wizard utilizando React e componentes Shadcn UI/Tailwind CSS.
- Integrar com endpoints de backend (a serem desenvolvidos ou já existentes) para a detecção de hardware.
- Implementar a lógica de navegação e estado do wizard.
- Apresentar ao usuário as opções de configuração de acordo com o hardware detectado, diferenciando entre o "Modo A: Legacy HA" e o "Modo B: Native ZFS".
- Coletar as configurações escolhidas pelo usuário e prepará-las para envio ao backend.

## Requisitos Funcionais

### RF.1 - Detecção de Hardware

- O wizard deve exibir informações relevantes sobre o hardware detectado (ex: tipo de controladora RAID, discos disponíveis).
- O sistema deve sugerir o modo de operação (Legacy HA ou Native ZFS) com base na capacidade da controladora RAID (suporte a HBA/JBOD).

### RF.2 - Seleção do Modo de Operação

- O usuário deve poder selecionar entre o "Modo A: Legacy HA" e o "Modo B: Native ZFS", com a opção sugerida previamente destacada.
- O wizard deve apresentar explicações claras sobre cada modo.

### RF.3 - Configuração Inicial

- O wizard deve guiar o usuário na configuração inicial do armazenamento ZFS e DRBD (se aplicável), conforme o modo selecionado.
- Deve haver etapas para configurar a rede e outras opções básicas do sistema.

### RF.4 - Feedback Visual

- O wizard deve fornecer feedback visual claro sobre o progresso e o status das operações.
- Mensagens de erro e validação devem ser apresentadas de forma compreensível.

### RF.5 - Salvamento da Configuração

- As configurações escolhidas pelo usuário devem ser enviadas ao backend para aplicação.

## Requisitos Não Funcionais

- **Performance:** A interface do wizard deve ser responsiva e carregar rapidamente.
- **Usabilidade:** O fluxo do wizard deve ser intuitivo e fácil de usar, mesmo para usuários com pouca experiência técnica.
- **Segurança:** A comunicação com o backend deve ser segura (HTTPS/TLS).
- **Consistência:** O design do wizard deve seguir as diretrizes de design do Ganache (Shadcn UI, Tailwind CSS).

## Cenários de Uso

### Cenário 1: Hardware Legado (Sem HBA/JBOD)

1. Usuário inicia o Wizard de Instalação.
2. Sistema detecta controladora RAID que não suporta HBA/JBOD.
3. Wizard sugere "Modo A: Legacy HA".
4. Usuário seleciona o modo sugerido.
5. Wizard guia o usuário na configuração do DRBD e ZFS sobre o DRBD.
6. Configuração é salva.

### Cenário 2: Hardware Moderno (Com HBA/JBOD)

1. Usuário inicia o Wizard de Instalação.
2. Sistema detecta controladora que suporta HBA/JBOD ou ausência de controladora.
3. Wizard sugere "Modo B: Native ZFS".
4. Usuário seleciona o modo sugerido.
5. Wizard guia o usuário na configuração do ZFS nativo.
6. Configuração é salva.

## Definições

- **Legacy HA:** Modo de operação que utiliza RAID de hardware e DRBD para alta disponibilidade.
- **Native ZFS:** Modo de operação que utiliza ZFS diretamente sobre os discos (HBA/JBOD).
- **Backend Endpoints:** APIs RESTful que o frontend consumirá para operações de detecção e configuração.
