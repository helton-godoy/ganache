# Recursos Core do Excalidraw

Conhecimento universal para criação de diagramas Excalidraw. Todos os agentes que criam arquivos Excalidraw devem referenciar estes recursos.

## Propósito

Fornece o **COMO** (conhecimento universal) enquanto os agentes fornecem o **O QUE** (aplicação específica do domínio).

**Core = "Como criar elementos Excalidraw"**

- Como agrupar formas com etiquetas de texto
- Como calcular a largura do texto
- Como criar setas com ligações adequadas
- Como validar sintaxe JSON
- Estrutura base e primitivas

**Agentes = "Quais diagramas criar"**

- Frame Expert (BMM): Fluxogramas técnicos, diagramas de arquitetura, wireframes
- Presentation Master (CIS): Apresentações, visuais criativos, máquinas Rube Goldberg
- Tech Writer (BMM): Diagramas de documentação, explicações conceituais

## Arquivos neste Diretório

### excalidraw-helpers.md

**Padrões universais de criação de elementos**

- Cálculo de largura de texto
- Regras de agrupamento de elementos (formas + etiquetas)
- Alinhamento de grade
- Criação de setas (reta, cotovelo)
- Aplicação de tema
- Lista de verificação de validação
- Regras de otimização

**Agentes referenciam isto para:**

- Criar formas agrupadas adequadamente
- Calcular dimensões de texto
- Conectar elementos com setas
- Garantir estrutura válida

### validate-json-instructions.md

**Processo universal de validação JSON**

- Como validar JSON do Excalidraw
- Erros comuns e correções
- Integração de fluxo de trabalho
- Recuperação de erros

**Agentes referenciam isto para:**

- Validar arquivos após criação
- Corrigir erros de sintaxe
- Garantir que arquivos possam ser abertos no Excalidraw

### library-loader.md (Futuro)

**Como carregar arquivos .excalidrawlib externos**

- Carregamento programático de biblioteca
- Integração de biblioteca da comunidade
- Gerenciamento de biblioteca personalizada

**Status:** A ser desenvolvido quando implementar suporte a biblioteca externa.

## Como os Agentes Usam Estes Recursos

### Exemplo: Frame Expert (Diagramas Técnicos)

```yaml
# workflows/diagrams/create-flowchart/workflow.yaml
helpers: '{project-root}/.bmad/core/resources/excalidraw/excalidraw-helpers.md'
json_validation: '{project-root}/.bmad/core/resources/excalidraw/validate-json-instructions.md'
```

**Adições específicas do domínio:**

```yaml
# workflows/diagrams/_shared/flowchart-templates.yaml
flowchart:
  start_node:
    type: ellipse
    width: 120
    height: 60
  process_box:
    type: rectangle
    width: 160
    height: 80
  decision_diamond:
    type: diamond
    width: 140
    height: 100
```

### Exemplo: Presentation Master (Visuais Criativos)

```yaml
# workflows/create-visual-metaphor/workflow.yaml
helpers: '{project-root}/.bmad/core/resources/excalidraw/excalidraw-helpers.md'
json_validation: '{project-root}/.bmad/core/resources/excalidraw/validate-json-instructions.md'
```

**Adições específicas do domínio:**

```yaml
# workflows/_shared/creative-templates.yaml
rube_goldberg:
  whimsical_connector:
    type: arrow
    strokeStyle: dashed
    roughness: 2
  playful_box:
    type: rectangle
    roundness: 12
```

## O Que Não Pertence ao Core

**Elementos Específicos do Domínio:**

- Templates específicos de fluxograma (pertence ao Frame Expert)
- Layouts de apresentação (pertence ao Presentation Master)
- Estilos específicos de documentação (pertence ao Tech Writer)

**Fluxos de Trabalho dos Agentes:**

- Como criar um fluxograma (fluxo de trabalho do Frame Expert)
- Como criar uma apresentação (fluxo de trabalho do Presentation Master)
- Criação de diagrama passo a passo (específico do agente)

**Temas:**

- Atualmente nos fluxos de trabalho dos agentes
- **Futuro:** Será refatorado para core como temas configuráveis pelo usuário

## Princípio de Arquitetura

**Única Fonte da Verdade:**

- Core mantém conhecimento universal
- Agentes referenciam core, não duplicam
- Atualizações no core beneficiam todos os agentes
- Agentes especializam-se com conhecimento do domínio

**DRY (Don't Repeat Yourself):**

- Lógica de criação de elementos: UMA VEZ no core
- Cálculo de largura de texto: UMA VEZ no core
- Processo de validação: UMA VEZ no core
- Padrões de ligação de setas: UMA VEZ no core

## Melhorias Futuras

1. **Carregador de Biblioteca Externa** - Carregar arquivos .excalidrawlib de libraries.excalidraw.com
2. **Gerenciamento de Temas** - Temas de cores configuráveis pelo usuário salvos no core
3. **Biblioteca de Componentes** - Componentes reutilizáveis compartilhados entre agentes
4. **Algoritmos de Layout** - Auxiliares de layout automático para posicionamento de elementos
