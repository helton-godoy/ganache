# Especificação da Track: Implementar a visualização do histórico de configuração na interface do usuário.

## 1. Visão Geral

Esta track visa introduzir uma nova funcionalidade na interface web do Ganache que permitirá aos usuários visualizar o histórico de alterações da configuração do sistema. A visualização deve apresentar uma linha do tempo clara das modificações, incluindo o que foi alterado, por quem e quando.

## 2. Objetivos

*   Fornecer uma interface intuitiva para navegar pelo histórico de configurações.
*   Exibir detalhes das alterações, como valores antigos e novos, para cada item de configuração.
*   Melhorar a auditabilidade e a capacidade de rastreamento de mudanças no sistema.

## 3. Funcionalidades Detalhadas

### 3.1. Listagem de Histórico de Configuração

*   A interface deve listar todos os eventos de alteração de configuração registrados no sistema.
*   Cada evento deve incluir:
    *   Timestamp da alteração.
    *   Usuário responsável pela alteração.
    *   Resumo da alteração (e.g., "Configuração de Rede Atualizada", "Parâmetro ZFS modificado").

### 3.2. Detalhes da Alteração

*   Ao selecionar um evento no histórico, o usuário deve ser capaz de visualizar os detalhes completos da alteração.
*   Isso deve incluir:
    *   A seção de configuração afetada.
    *   Os parâmetros específicos que foram alterados.
    *   Os valores anteriores e os novos valores de cada parâmetro.
    *   Um mecanismo para diferenciar visualmente as alterações (e.g., highlighting de diff).

### 3.3. Filtragem e Busca (Opcional, para fases futuras)

*   Possibilidade de filtrar o histórico por período de tempo, tipo de configuração ou usuário.
*   Funcionalidade de busca para encontrar alterações específicas.

## 4. Design da Interface do Usuário (UI)

*   A visualização do histórico de configuração será integrada como uma nova seção ou aba na interface de administração.
*   Será utilizada uma abordagem de "linha do tempo" ou "lista de eventos" para apresentar o histórico.
*   Os componentes existentes do Shadcn UI e as diretrizes de design do Tailwind CSS serão seguidos para manter a consistência visual.

## 5. Considerações Técnicas

*   **Frontend:**
    *   Utilizará Next.js/React para a construção da interface.
    *   Consumirá dados da API de backend para obter o histórico de configurações.
    *   Implementará componentes de UI para exibir os dados de forma clara e interativa.
*   **Backend:**
    *   A API Rust (`ganache-api`) deverá expor um endpoint para consultar o histórico de configurações.
    *   A lógica de `ganache-lib` (especialmente `git.rs`) será fundamental para extrair e formatar os dados de histórico de configuração baseados em Git.
    *   Garantir que a API retorne dados de forma eficiente e paginada, se necessário.

## 6. Critérios de Aceitação

*   A página de histórico de configuração é acessível através da navegação principal.
*   O histórico exibe corretamente os timestamps e os usuários.
*   Ao selecionar um item do histórico, os detalhes da alteração (parâmetros, valores antigos/novos) são exibidos com precisão.
*   A interface é responsiva e segue as diretrizes de design do Ganache.
*   O backend fornece os dados de histórico de configuração de forma confiável e eficiente.
