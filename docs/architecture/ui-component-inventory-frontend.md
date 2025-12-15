# UI Component Inventory - Ganache UI

**Framework:** React 18
**Library Visual:** Material UI v5
**Build Tool:** Vite

## 🧩 Componentes Principais

### Dashboard (`Dashboard.tsx`)

Painel principal de monitoramento do sistema.

- **Dependências:** `useSystemStore`, Material UI (`Grid`, `Paper`, `LinearProgress`).
- **Funcionalidades:**
  - **CPU Monitor:** Exibe uso de CPU com cores dinâmicas (Verde/Laranja/Vermelho).
  - **Memory Monitor:** Barra de progresso visual para uso de RAM.
  - **Uptime Display:** Contador de tempo de atividade formatado.
  - **Auto-refresh:** Atualiza dados a cada 5 segundos via Store.

### SmbManager (`SmbManager.tsx`)

Gerenciador de compartilhamentos SMB.

- **Dependências:** `useSmbStore`, Material UI.
- **Funcionalidades:**
  - Listagem de shares.
  - Provável formulário de criação/edição (inferred).

## 🎨 Design System

O projeto utiliza **Material UI (MUI)** como base do sistema de design.

- **Ícones:** `@mui/icons-material` (Speed, Memory, AccessTime).
- **Layout:** Uso extensivo de `Grid` System a `Box`.
- **Feedback Visual:** `LinearProgress` para métricas e `Chip` para status.

## 🔄 Estrutura de Diretórios UI

```
ganache/ui/src/
├── components/   # Componentes React Reutilizáveis e Páginas
├── stores/       # Gerenciamento de Estado Global (Zustand)
├── api/          # Clientes API e Tipagens (OpenAPI)
├── routes/       # Definição de Rotas (React Router)
└── mocks/        # Mocks para testes/desenvolvimento
```
