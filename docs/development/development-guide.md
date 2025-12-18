# Development Guide - Ganache

## 🛠️ Prerequisites

- **Node.js:** v20+ (LTS)
- **Package Manager:** `pnpm` (Preferred) or `npm`
- **System:** Linux (Debian 13 recommended for full feature parity) or macOS (Limited functionality)

## 🚀 Setup Environment

### 1. Clone and Install

```bash
git clone <repo_url>
cd GANACHE
pnpm install
```

### 2. Run Development Server

The application is a monolithic Next.js app.

```bash
pnpm dev
# Server will start on http://localhost:3000
```

> **Note:** Some features (ZFS, DRBD) require root access and specific kernel modules. In development mode on non-Linux systems, these calls will either fail or return mock data (if implemented).

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### E2E Testing (Playwright)

```bash
npx playwright test
```

## 📦 Production Build

```bash
pnpm build
pnpm start
```
