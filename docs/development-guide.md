# Development Guide - Ganache

## 🛠️ Pré-requisitos

- **Rust:** Toolchain estável (Cargo 1.70+)
- **Node.js:** v18+ (LTS recomendado)
- **Gerenciador de Pacotes:** `npm` ou `pnpm`
- **Ferramentas de Build:** `make`, `gcc` (para compilação Rust)

## 🚀 Setup do Ambiente

### 1. Clonar e Preparar

```bash
git clone <repo_url>
cd GANACHE
chmod +x scripts/setup_ganache_enhanced.sh
```

### 2. Backend (Rust)

O backend reside em `ganache/src/ganache-api`.

```bash
cd ganache
# Build em modo debug
cargo build

# Rodar servidor localmente
cargo run
```

O servidor iniciará (porta padrão a verificar, geralmente 8080 ou 8000).

### 3. Frontend (React)

O frontend reside em `ganache/ui`.

```bash
cd ganache/ui
npm install

# Rodar servidor de desenvolvimento (Vite)
npm run dev
```

O frontend estará acessível em `http://localhost:5173` (padrão Vite).

## 🧪 Testes

### Backend

```bash
cd ganache
cargo test
```

### Frontend

```bash
cd ganache/ui
npm run type-check # Se configurado (tsc)
npm run lint
```

## 📦 Build de Produção

Utilize o `Makefile` na raiz para builds automatizados:

```bash
# Build do Frontend (gera arquivos em ganache/ui/dist)
make ui

# Build do Backend (Release)
cd ganache && cargo build --release
```
