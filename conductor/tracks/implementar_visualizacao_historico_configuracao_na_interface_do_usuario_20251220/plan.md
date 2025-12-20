# Plano da Track: Implementar a visualização do histórico de configuração na interface do usuário.

## Fase 1: Backend - Exposição da API de Histórico de Configuração

### Objetivos da Fase
*   Desenvolver e expor um endpoint na API Rust para recuperar o histórico de configurações baseado no Git.
*   Garantir que a API retorne dados estruturados e eficientes para o frontend.

### Tarefas

*   **Tarefa 1: Análise e Refatoração (ganache-lib/git.rs)**
    *   [ ] Task: Escrever testes unitários para a função de extração de histórico de Git em `ganache-lib/git.rs`.
    *   [ ] Task: Refatorar `ganache-lib/git.rs` para extrair e formatar dados de commit do Git de forma genérica para histórico de configuração.
    *   [ ] Task: Escrever testes de integração para a funcionalidade refatorada de `ganache-lib/git.rs`.

*   **Tarefa 2: Desenvolvimento do Endpoint da API (ganache-api)**
    *   [ ] Task: Escrever testes de unidade para o novo endpoint da API que irá expor o histórico de configuração.
    *   [ ] Task: Implementar o novo endpoint na `ganache-api` para consumir a funcionalidade de `ganache-lib/git.rs` e retornar o histórico de configuração.
    *   [ ] Task: Atualizar a documentação OpenAPI (`docs/openapi.json`) com o novo endpoint de histórico de configuração.

*   [ ] Task: Conductor - User Manual Verification 'Backend - Exposição da API de Histórico de Configuração' (Protocol in workflow.md)

## Fase 2: Frontend - Implementação da Interface de Usuário do Histórico de Configuração

### Objetivos da Fase
*   Desenvolver a interface de usuário para exibir o histórico de configuração.
*   Integrar a interface com a API de backend recém-criada.

### Tarefas

*   **Tarefa 1: Criação da Página e Roteamento**
    *   [ ] Task: Escrever testes de unidade para o novo componente de página do histórico de configuração.
    *   [ ] Task: Criar a nova página (`src/app/history/page.tsx` ou similar) e configurar o roteamento para ela.
    *   [ ] Task: Escrever testes de unidade para os componentes de UI de listagem do histórico.

*   **Tarefa 2: Desenvolvimento do Componente de Listagem do Histórico**
    *   [ ] Task: Implementar o componente de listagem para exibir os eventos do histórico, incluindo timestamp, usuário e resumo.
    *   [ ] Task: Integrar o componente de listagem com a API de histórico de configuração do backend.

*   **Tarefa 3: Desenvolvimento do Componente de Detalhes da Alteração**
    *   [ ] Task: Escrever testes de unidade para o componente de detalhes da alteração.
    *   [ ] Task: Implementar o componente de detalhes para exibir os valores antigos e novos de cada parâmetro de configuração.
    *   [ ] Task: Adicionar highlighting de diff para as alterações.

*   **Tarefa 4: Integração e Estilização**
    *   [ ] Task: Escrever testes de integração para a página completa do histórico de configuração.
    *   [ ] Task: Integrar os componentes de listagem e detalhes na página principal do histórico.
    *   [ ] Task: Aplicar estilização utilizando Tailwind CSS e componentes Shadcn UI para garantir a consistência visual.

*   [ ] Task: Conductor - User Manual Verification 'Frontend - Implementação da Interface de Usuário do Histórico de Configuração' (Protocol in workflow.md)

## Fase 3: Testes de Integração e Validação Final

### Objetivos da Fase
*   Garantir a comunicação correta entre frontend e backend.
*   Validar a funcionalidade completa da visualização do histórico de configuração.

### Tarefas

*   **Tarefa 1: Testes E2E (Playwright)**
    *   [ ] Task: Escrever testes E2E usando Playwright para validar o fluxo completo do usuário na visualização do histórico de configuração.
    *   [ ] Task: Executar os testes E2E e garantir que todos passem.

*   **Tarefa 2: Revisão de Código e Documentação**
    *   [ ] Task: Realizar uma revisão de código completa para garantir a qualidade, aderência aos padrões e ausência de bugs.
    *   [ ] Task: Atualizar qualquer documentação relevante (e.g., `README.md`, `CONTRIBUTING.md`) se necessário.

*   [ ] Task: Conductor - User Manual Verification 'Testes de Integração e Validação Final' (Protocol in workflow.md)
