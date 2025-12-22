# Fluxograma de Rollback de Configuração (One-Click)

```mermaid
flowchart TD
    A[Selecionar Commit na Timeline UI] --> B[Clicar 'Rollback to this Point']
    B --> C[Confirmar Ação]
    C --> D[Checkout do Commit Git Específico]
    D --> E[Aplicar Arquivos de Configuração ao Sistema]
    E --> F[Reiniciar Serviços Afetados]
    F --> G[Criar Commit de 'Rollback' para Documentar Ação]
    G --> H[Rollback Concluído com Sucesso]

    classDef user fill:#fce4ec
    classDef system fill:#e8f5e8
    classDef confirm fill:#fff3e0

    class A,B user
    class D,E,F,G system
    class C confirm