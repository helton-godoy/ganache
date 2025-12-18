# Source Tree Analysis - Ganache

**Raiz do Projeto:** `/home/helton/git/GANACHE`

## 🌳 Estrutura de Diretórios

```shell
GANACHE/
├── Makefile                 # Automação de tarefas
├── scripts/                 # Scripts auxiliares
├── docs/                    # Documentação do projeto
├── src/                     # Source Code Principal (Next.js)
│   ├── app/                 # App Router (Pages & API)
│   │   ├── api/             # tRPC Handler endpoint
│   │   ├── layout.tsx       # Root Layout
│   │   └── page.tsx         # Dashboard Principal
│   ├── server/              # Backend Logic
│   │   └── api/             # tRPC Routers
│   │       ├── root.ts      # App Router Definition
│   │       └── routers/     # Domain Routers (zfs, system)
│   ├── lib/                 # Core Utilities
│   │   ├── sudo.ts          # Privilege Wrapper
│   │   └── zfs.ts           # ZFS Command Wrapper
│   └── components/          # UI Components
│       ├── ui/              # Shadcn UI (Presentation)
│       └── features/        # Business Logic Components
├── public/                  # Static Assets
├── next.config.mjs          # Next.js Config
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript Config
```

## 📍 Pontos Críticos

### Full Stack (`src/app` + `src/server`)

- **Core Logic:** A aplicação é um monólito Next.js.
- **API Entry Point:** `src/app/api/trpc/[trpc]/route.ts` expõe o servidor tRPC.
- **System Integration:** `src/lib/` contém os wrappers seguros para execução de comandos.ganache/` define o contrato que o backend implementa e o frontend consome.

### Frontend (`ganache/ui`)

- **Single Page Application:** Construído com Vite + React.
- **State Management:** Zustand gerencia estados complexos (`stores/`).
- **API Integration:** O código em `api/` é fortemente tipado com base no `schema.d.ts` (gerado do OpenAPI), garantindo segurança de tipos entre Back e Front.

### Automação

- **Makefile:** Orquestra o build de ambos (backend e frontend) e tarefas de instalação.
- **Scripts:** `setup_ganache_enhanced.sh` prepara o ambiente de desenvolvimento/produção.
