# Inventário de Componentes - GANACHE

## Visão Geral

O frontend do GANACHE utiliza uma arquitetura de componentes React com separação clara entre componentes de negócio (features) e componentes base (ui), seguindo o padrão de biblioteca de componentes reutilizáveis.

## Componentes de Features (Negócio)

### ACL (Controle de Acesso)

- **AclEditor.tsx**: Editor visual de listas de controle de acesso NFSv4
- **AclRecursiveDialog.tsx**: Diálogo para aplicação recursiva de ACLs

### Dashboard

- **status-dashboard.tsx**: Dashboard principal de status do sistema

### Histórico

- **ConfigurationTimeline.tsx**: Timeline visual de mudanças de configuração
- **RollbackButton.tsx**: Botão para rollback de configuração

### Pânico/Recuperação

- **recovery-console.tsx**: Console de recuperação de emergência

### Segurança

- **AuditSearch.tsx**: Interface de busca em logs de auditoria
- **EventTimeline.tsx**: Timeline de eventos de segurança em tempo real
- **SecurityDashboard.tsx**: Dashboard consolidado de monitoramento de segurança
- **SecurityMetrics.tsx**: Métricas e indicadores de segurança

### Setup/Configuração

- **ClusterConnectionVisualizer.tsx**: Visualização de conexão de cluster
- **server-blade.tsx**: Componente de blade de servidor
- **setup-wizard.tsx**: Wizard principal de configuração
- **WizardCompatibilityStep.tsx**: Etapa de compatibilidade do wizard
- **WizardWelcomeStep.tsx**: Etapa inicial do wizard

### Storage

- **CreateDatasetDialog.tsx**: Diálogo de criação de dataset
- **DatasetManager.tsx**: Gerenciador de datasets ZFS
- **disk.tsx**: Componente de disco
- **PoolCreationWizard.tsx**: Wizard de criação de pool

### Outros Features

- **BootEnvironmentBadge.tsx**: Badge para ambientes de boot
- **BootEnvironmentList.tsx**: Lista de ambientes de boot
- **ClusterJoinWizard.tsx**: Wizard de junção ao cluster
- **TwinViewTopology.tsx**: Visualização topológica twin-view

## Componentes UI (Base)

### Layout e Containers

- **accordion.tsx**: Componente de acordeão
- **card.tsx**: Cartão de conteúdo
- **dialog.tsx**: Diálogo modal
- **alert-dialog.tsx**: Diálogo de alerta

### Formulários

- **button.tsx**: Botão customizável
- **input.tsx**: Campo de entrada
- **label.tsx**: Rótulo de formulário
- **textarea.tsx**: Área de texto
- **checkbox.tsx**: Checkbox
- **select.tsx**: Select dropdown

### Feedback

- **badge.tsx**: Badge de status
- **progress.tsx**: Barra de progresso
- **toast.tsx**: Notificações toast
- **toaster.tsx**: Container de toasts
- **sonner.tsx**: Notificações sonner

### Utilitários

- **confirmation-dialog.tsx**: Diálogo de confirmação
- **table.tsx**: Tabela de dados
- **tooltip.tsx**: Tooltip informativo

## Provedores e Hooks

### Provedores

- **query-provider.tsx**: Provedor React Query para estado global

### Hooks

- **use-cluster-configuration.ts**: Hook para configuração de cluster
- **use-hardware-detection.ts**: Hook para detecção de hardware
- **useSecurityEvents.ts**: Hook para eventos de segurança em tempo real

## Padrões de Uso

- **Separação de Responsabilidades:** Features para lógica de negócio, UI para componentes base
- **Reutilização:** Componentes UI são agnósticos e reutilizáveis
- **Estado:** Gerenciado via hooks customizados e React Query
- **Estilização:** Tailwind CSS + Radix UI para acessibilidade

## Estatísticas

- **Total de Componentes:** 35+
- **Componentes de Features:** 23
- **Componentes UI:** 12
- **Hooks Customizados:** 3
- **Provedores:** 1
