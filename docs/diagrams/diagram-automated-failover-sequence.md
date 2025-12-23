# Diagrama de Sequência de Failover Automatizado

```mermaid
sequenceDiagram
    participant P as Nó Primário
    participant S as Nó Secundário
    participant ZFS as ZFS Pool
    participant VIP as Virtual IP
    participant U as Usuários

    Note over P,S: Cluster Saudável
    P--xS: Falha de Energia (Plug Pull)
    S->>S: Detecta Perda em <5s
    S->>S: Promove-se a Primário
    S->>ZFS: Importa ZFS Pool
    ZFS-->>S: Pool Importado
    S->>VIP: Assume Endereço Virtual IP
    VIP-->>S: IP Atribuído
    U->>S: Continuam Trabalhando
    Note over S: Downtime Total <30s