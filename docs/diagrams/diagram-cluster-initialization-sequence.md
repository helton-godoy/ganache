# Diagrama de Sequência de Inicialização do Cluster

```mermaid
sequenceDiagram
    participant U as Usuário/Admin
    participant P as Nó Primário
    participant S as Nó Secundário
    participant DRBD as DRBD Service

    U->>P: Iniciar "Cluster Join"
    P->>S: Verificar Troca de Chaves SSH
    S-->>P: Confirmação SSH OK
    P->>DRBD: Configurar Recursos DRBD no Disco Secundário
    DRBD-->>P: Recursos Configurados
    P->>DRBD: Iniciar Sincronização Inicial Block-Level
    DRBD-->>P: Sincronização Iniciada
    P-->>U: Cluster Inicializado com Sucesso