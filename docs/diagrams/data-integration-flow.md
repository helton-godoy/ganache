# Fluxograma de Integração de Dados (Contrato Prime)

```mermaid
flowchart TD
    A[Alteração no Backend] --> B[Modifica ganache-api<br/>Estruturas Serde]
    B --> C[Geração de Spec<br/>Binário Rust gera openapi.json]
    C --> D[Geração de SDK<br/>Orval cria hooks TypeScript]
    D --> E[Consumo no Frontend<br/>Componentes usam hooks gerados]
    E --> F[Requisições Type-Safe<br/>para ganache-core]

    classDef process fill:#bbdefb
    classDef output fill:#c8e6c9

    class A,B,C,D,E,F process