#!/bin/bash
set -e

echo "🚀 Ganache Enhanced Repository Setup - v2.0"
echo "📊 Incorporating Winston Architecture + Barry Implementation + Master Validations"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
	echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
	echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
	echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."
command -v git >/dev/null 2>&1 || {
	echo "❌ git is required but not installed. Aborting." >&2
	exit 1
}
command -v node >/dev/null 2>&1 || {
	echo "❌ node is required but not installed. Aborting." >&2
	exit 1
}
command -v npm >/dev/null 2>&1 || {
	echo "❌ npm is required but not installed. Aborting." >&2
	exit 1
}
command -v cargo >/dev/null 2>&1 || { echo "⚠️ cargo not found - Rust backend will be setup but not built"; }
print_success "Prerequisites check completed"

# 1. Create Root Directory Structure
print_step "Creating enhanced directory structure..."
mkdir -p ganache/{src,ui,debian}
cd ganache
git init
print_success "Root structure created"

# 2. THE CONSTITUTION - Enhanced OpenAPI Spec (Winston Validated)
print_step "Creating enhanced OpenAPI specification with ZFS endpoints..."
cat >api-spec.yaml <<'EOF'
# ARQUIVO: ganache/api-spec.yaml
# Enhanced OpenAPI v1.0 - Incorporating Winston Architecture + ZFS Support
openapi: 3.0.3
info:
  title: Ganache NAS API
  description: API for Ganache Enterprise NAS (Proxmox-based).
  version: 1.0.0
servers:
  - url: /api2/json
    description: Production & Mock Server relative path

paths:
  # --- SMB Management ---
  /ganache/smb/shares:
    get:
      summary: List all SMB shares
      operationId: listSmbShares
      tags: [SMB]
      responses:
        "200":
          description: List of shares
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/SmbShare"
    post:
      summary: Create a new SMB share
      operationId: createSmbShare
      tags: [SMB]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SmbShareConfig"
      responses:
        "200":
          description: Share created successfully (Task ID returned)
          content:
            application/json:
              schema:
                type: string
                description: "UPID (Proxmox Task ID)"

  # --- ZFS Management (Enhanced) ---
  /ganache/storage/zfs:
    get:
      summary: List ZFS Pools
      operationId: listZfsPools
      tags: [ZFS]
      responses:
        "200":
          description: Active ZFS pools
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ZfsPool"
    post:
      summary: Create a new ZFS Pool
      operationId: createZfsPool
      tags: [ZFS]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ZfsPoolConfig"
      responses:
        "200":
          description: Pool created successfully
          content:
            application/json:
              schema:
                type: string

  /ganache/storage/zfs/datasets:
    get:
      summary: List ZFS Datasets
      operationId: listZfsDatasets
      tags: [ZFS]
      parameters:
        - name: pool
          in: query
          required: false
          schema:
            type: string
      responses:
        "200":
          description: List of datasets
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ZfsDataset"

  # --- System Status ---
  /nodes/localhost/status:
    get:
      summary: Get system status (CPU, RAM, Uptime) - PBS Compatible
      operationId: getNodeStatus
      tags: [System]
      responses:
        "200":
          description: Node status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/NodeStatus"

components:
  schemas:
    SmbShare:
      type: object
      properties:
        name: 
          type: string
          example: "financeiro"
        path: 
          type: string
          example: "/mnt/tank/financeiro"
        guest_ok: 
          type: boolean
          description: "Allow guest access"
        read_only: 
          type: boolean
          description: "Read-only share"
        comment: 
          type: string
          description: "Share description"

    SmbShareConfig:
      type: object
      required: [name, path]
      properties:
        name: 
          type: string
          pattern: "^[a-zA-Z0-9_-]+$"
          description: "Share name (alphanumeric, underscore, hyphen only)"
        path: 
          type: string
          description: "ZFS dataset mountpoint"
        guest_ok: 
          type: boolean
          default: false
          description: "Allow guest access"
        timemachine: 
          type: boolean
          default: false
          description: "Enable Apple Time Machine support"

    ZfsPool:
      type: object
      properties:
        name: 
          type: string
          example: "tank"
        health: 
          type: string
          enum: [ONLINE, DEGRADED, FAULTED, OFFLINE, UNAVAIL]
          example: "ONLINE"
        size: 
          type: integer
          description: "Pool size in bytes"
          example: 1000000000000
        free: 
          type: integer
          description: "Free space in bytes"
          example: 800000000000
        allocated: 
          type: integer
          description: "Allocated space in bytes"
          example: 200000000000
        fragmentation: 
          type: number
          description: "Fragmentation percentage"
          example: 15.5

    ZfsPoolConfig:
      type: object
      required: [name, devices]
      properties:
        name: 
          type: string
          pattern: "^[a-zA-Z0-9_-]+$"
          description: "Pool name"
        devices: 
          type: array
          items:
            type: string
          description: "List of block devices"
        raid_level: 
          type: string
          enum: [mirror, raidz1, raidz2, raidz3]
          description: "RAID level"

    ZfsDataset:
      type: object
      properties:
        name: 
          type: string
          example: "tank/financeiro"
        pool: 
          type: string
          example: "tank"
        mountpoint: 
          type: string
          example: "/mnt/tank/financeiro"
        used: 
          type: integer
          description: "Used space in bytes"
        available: 
          type: integer
          description: "Available space in bytes"
        compression: 
          type: string
          example: "lz4"
        atime: 
          type: boolean
          description: "Access time tracking"

    NodeStatus:
      type: object
      properties:
        uptime: 
          type: integer
          description: "System uptime in seconds"
        cpu: 
          type: number
          minimum: 0
          maximum: 1
          description: "CPU usage (0.0 to 1.0)"
        memory: 
          type: object
          properties:
            total: 
              type: integer
              description: "Total memory in bytes"
            used: 
              type: integer
              description: "Used memory in bytes"
            available: 
              type: integer
              description: "Available memory in bytes"
        load_average: 
          type: array
          items:
            type: number
          description: "Load average (1m, 5m, 15m)"
EOF
print_success "Enhanced OpenAPI specification created with ZFS endpoints"

# 3. BACKEND RUST - Enhanced Workspace (Winston Architecture)
print_step "Creating enhanced Cargo workspace with modular architecture..."
cat >Cargo.toml <<'EOF'
[workspace]
resolver = "2"
members = [
    "src/ganache-api",
    "src/ganache-core", 
    "src/ganache-storage",
    "src/ganache-auth",
]

[workspace.dependencies]
# Common dependencies across all crates
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
thiserror = "1.0"
anyhow = "1.0"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["fmt"] }

# HTTP server
actix-web = "4.0"
actix-cors = "0.6"

# Error handling
eyre = "0.6"
color-eyre = "0.6"
EOF

# Create modular Rust structure
mkdir -p src/ganache-{api,core,storage,auth}

# ganache-api crate
cat >src/ganache-api/Cargo.toml <<'EOF'
[package]
name = "ganache-api"
version = "0.1.0"
edition = "2021"

[dependencies]
# Workspace dependencies
tokio = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
thiserror = { workspace = true }
anyhow = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }

# HTTP server
actix-web = { workspace = true }
actix-cors = { workspace = true }

# Internal crates
ganache-core = { path = "../ganache-core" }
ganache-storage = { path = "../ganache-storage" }
ganache-auth = { path = "../ganache-auth" }

[dev-dependencies]
tempfile = "3.0"
EOF

cat >src/ganache-api/src/main.rs <<'EOF'
//! Ganache API Server
//! 
//! Main HTTP server for Ganache Enterprise NAS
//! Based on Proxmox Backup Server architecture

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::env;

mod routes;
mod handlers;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ganache_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()?;

    tracing::info!("🚀 Starting Ganache API Server on port {}", port);

    HttpServer::new(|| {
        App::new()
            // Enable CORS for development
            .wrap(Cors::permissive())
            // Configure JSON extractor
            .app_data(web::JsonConfig::default().limit(10 * 1024 * 1024)) // 10MB
            // Register routes
            .service(web::scope("/api2/json")
                .service(routes::smb_routes())
                .service(routes::system_routes())
                .service(routes::zfs_routes())
            )
            // Health check endpoint
            .route("/health", web::get().to(health_check))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await?;

    Ok(())
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "ganache-api",
        "version": "0.1.0"
    }))
}
EOF

# Other crate stubs
for crate_name in ganache-core ganache-storage ganache-auth; do
	cat >src/$crate_name/Cargo.toml <<EOF
[package]
name = "$crate_name"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { workspace = true }
serde_json = { workspace = true }
thiserror = { workspace = true }
anyhow = { workspace = true }
EOF

	cat >src/$crate_name/src/lib.rs <<EOF
//! $crate_name module
//! 
//! TODO: Implement according to Winston architecture

pub fn hello() -> String {
    format!("Hello from {}!", "$crate_name")
}
EOF
done

print_success "Enhanced Cargo workspace created with modular architecture"

# 4. FRONTEND REACT - Enhanced Setup (Barry Implementation + Master Validations)
print_step "Creating enhanced React frontend with OpenAPI integration..."

# Create UI structure
mkdir -p ui/src/{api,components,stores,mocks,routes}

# Enhanced package.json with all validated dependencies
cat >ui/package.json <<'EOF'
{
  "name": "ganache-web-ui",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "api:gen": "openapi-typescript ../api-spec.yaml -o src/api/schema.d.ts",
    "api:client": "openapi-fetch ../api-spec.yaml -o src/api/client.ts",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "openapi-fetch": "^0.9.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "msw": "^2.2.0",
    "openapi-typescript": "^6.7.0",
    "typescript": "^5.2.0",
    "vite": "^5.1.0"
  }
}
EOF

# Enhanced Vite config
cat >ui/vite.config.ts <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@stores': resolve(__dirname, './src/stores'),
      '@api': resolve(__dirname, './src/api'),
      '@mocks': resolve(__dirname, './src/mocks'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api2/json': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
EOF

# TypeScript configs
cat >ui/tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@stores/*": ["./src/stores/*"],
      "@api/*": ["./src/api/*"],
      "@mocks/*": ["./src/mocks/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat >ui/tsconfig.node.json <<'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# HTML index
cat >ui/index.html <<'EOF'
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ganache Enterprise NAS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Enhanced API Client (Master Validation)
cat >ui/src/api/client.ts <<'EOF'
import createClient from 'openapi-fetch'
import { paths } from './schema'

// Create typed client
export const api = createClient<paths>({
  baseUrl: '/api2/json',
})

// API helper functions
export const smbApi = {
  // List SMB shares
  getShares: async () => {
    const { data, error } = await api.GET('/ganache/smb/shares')
    if (error) throw new Error('Failed to fetch SMB shares')
    return data || []
  },

  // Create SMB share
  createShare: async (config: {
    name: string
    path: string
    guest_ok?: boolean
    timemachine?: boolean
  }) => {
    const { data, error } = await api.POST('/ganache/smb/shares', {
      body: config,
    })
    if (error) throw new Error('Failed to create SMB share')
    return data
  },
}

export const systemApi = {
  // Get system status
  getStatus: async () => {
    const { data, error } = await api.GET('/nodes/localhost/status')
    if (error) throw new Error('Failed to fetch system status')
    return data
  },
}

export const zfsApi = {
  // List ZFS pools (when implemented)
  getPools: async () => {
    try {
      const { data, error } = await api.GET('/ganache/storage/zfs')
      if (error) throw new Error('Failed to fetch ZFS pools')
      return data || []
    } catch (error) {
      // Return empty array if endpoint not implemented yet
      return []
    }
  },
}

// Error handling helper
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}
EOF

# Enhanced SMB Store (Barry Validated)
cat >ui/src/stores/smbStore.ts <<'EOF'
import { create } from 'zustand'
import { smbApi, handleApiError } from '../api/client'
import type { components } from '../api/schema'

// Types from OpenAPI schema
type SmbShare = components['schemas']['SmbShare']
type SmbShareConfig = components['schemas']['SmbShareConfig']

interface SmbState {
    shares: SmbShare[]
    loading: boolean
    error: string | null
    fetchShares: () => Promise<void>
    createShare: (config: SmbShareConfig) => Promise<void>
    clearError: () => void
}

export const useSmbStore = create<SmbState>((set, get) => ({
    shares: [],
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchShares: async () => {
        set({ loading: true, error: null })
        try {
            const shares = await smbApi.getShares()
            set({ shares, loading: false })
        } catch (err) {
            const errorMessage = handleApiError(err)
            set({ error: errorMessage, loading: false })
        }
    },

    createShare: async (config) => {
        set({ loading: true, error: null })
        try {
            await smbApi.createShare(config)
            // Refresh the list after creation
            await get().fetchShares()
            set({ loading: false })
        } catch (err) {
            const errorMessage = handleApiError(err)
            set({ error: errorMessage, loading: false })
        }
    },
}))
EOF

# Enhanced System Store (Barry Validated)
cat >ui/src/stores/systemStore.ts <<'EOF'
import { create } from 'zustand'
import { systemApi, handleApiError } from '../api/client'
import type { components } from '../api/schema'

// Types from OpenAPI schema
type NodeStatus = components['schemas']['NodeStatus']

interface SystemState {
    status: NodeStatus | null
    loading: boolean
    error: string | null
    fetchStatus: () => Promise<void>
    clearError: () => void
}

export const useSystemStore = create<SystemState>((set) => ({
    status: null,
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchStatus: async () => {
        set({ loading: true, error: null })
        try {
            const status = await systemApi.getStatus()
            set({ status, loading: false })
        } catch (err) {
            const errorMessage = handleApiError(err)
            set({ error: errorMessage, loading: false })
        }
    },
}))
EOF

# Enhanced Mock Handlers (Barry Implementation)
cat >ui/src/mocks/handlers.ts <<'EOF'
import { http, HttpResponse } from 'msw'

// Simulando delay de rede para realismo
const DELAY_MS = 500;

export const handlers = [
    // Mock: List SMB Shares
    http.get('/api2/json/ganache/smb/shares', async () => {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        return HttpResponse.json([
            { name: 'financeiro', path: '/mnt/tank/financeiro', guest_ok: false, read_only: false, comment: 'Dados Financeiros' },
            { name: 'publico', path: '/mnt/tank/publico', guest_ok: true, read_only: true, comment: 'Arquivos Gerais' }
        ])
    }),

    // Mock: System Status
    http.get('/api2/json/nodes/localhost/status', async () => {
        return HttpResponse.json({
            uptime: 3600,
            cpu: 0.15, // 15%
            memory: {
                total: 16000000000,
                used: 4000000000
            }
        })
    }),

    // Mock: Create Share
    http.post('/api2/json/ganache/smb/shares', async () => {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        // Simula retorno de Task ID do Proxmox
        return HttpResponse.json("UPID:ganache:00000001:00000000:00000000:task:create_share:root@pam:")
    }),

    // Mock: ZFS Pools (Enhanced)
    http.get('/api2/json/ganache/storage/zfs', async () => {
        return HttpResponse.json([
            {
                name: 'tank',
                health: 'ONLINE',
                size: 1000000000000,
                free: 800000000000,
                allocated: 200000000000,
                fragmentation: 15.5
            }
        ])
    })
]
EOF

# Enhanced Dashboard Component (Barry Validated)
cat >ui/src/components/Dashboard.tsx <<'EOF'
// ARQUIVO: ganache/ui/src/components/Dashboard.tsx
import React, { useEffect } from 'react'
import { Grid, Paper, Typography, Box, LinearProgress, Chip } from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import MemoryIcon from '@mui/icons-material/Memory'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useSystemStore } from '../stores/systemStore'

// Helper para formatar Bytes
const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 GiB'
    const gib = bytes / (1024 * 1024 * 1024)
    return `${gib.toFixed(2)} GiB`
}

// Helper para formatar Uptime
const formatUptime = (seconds?: number) => {
    if (!seconds) return '0d 0h 0m'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
}

export const Dashboard: React.FC = () => {
    const { status, fetchStatus } = useSystemStore()

    // Auto-refresh a cada 5s
    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    if (!status) return <LinearProgress />

    // Cálculos visuais
    const cpuPercent = (status.cpu || 0) * 100
    const memory = status.memory || { total: 0, used: 0 }
    const usedMemory = memory.used || 0
    const totalMemory = memory.total || 0
    const ramPercent = totalMemory ? (usedMemory / totalMemory) * 100 : 0

    // Cor dinâmica da CPU (Verde -> Laranja -> Vermelho)
    const getStatusColor = (val: number) =>
        val > 90 ? 'error' : val > 70 ? 'warning' : 'primary'

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Dashboard
                <Chip label="Online" color="success" size="small" variant="outlined" />
            </Typography>

            <Grid container spacing={3}>
                {/* CPU Card */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SpeedIcon color={getStatusColor(cpuPercent)} sx={{ mr: 1 }} />
                            <Typography variant="h6">CPU</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                            {cpuPercent.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={cpuPercent}
                            color={getStatusColor(cpuPercent)}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            4 Cores (Load Average)
                        </Typography>
                    </Paper>
                </Grid>

                {/* Memory Card */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <MemoryIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Memória</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                            {ramPercent.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={ramPercent}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Usado: {formatBytes(usedMemory)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total: {formatBytes(totalMemory)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Uptime Card */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="text.secondary">Uptime</Typography>
                        </Box>
                        <Typography variant="h4">
                            {formatUptime(status.uptime)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Desde o último boot
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
EOF

# Enhanced SMB Manager Component (Barry Validated)
cat >ui/src/components/SmbManager.tsx <<'EOF'
import React, { useEffect, useState } from 'react'
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Typography, Box, Chip, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, FormControlLabel, Switch, Alert, LinearProgress
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import StorageIcon from '@mui/icons-material/Storage'
import { useSmbStore } from '../stores/smbStore'

export const SmbManager: React.FC = () => {
    const { shares, loading, error, fetchShares, createShare } = useSmbStore()
    const [open, setOpen] = useState(false)

    // Form State
    const [newName, setNewName] = useState('')
    const [newPath, setNewPath] = useState('/mnt/tank/')
    const [guestOk, setGuestOk] = useState(false)

    useEffect(() => {
        fetchShares()
    }, [])

    const handleCreate = async () => {
        await createShare({ name: newName, path: newPath, guest_ok: guestOk })
        setOpen(false)
        // Reset form
        setNewName('')
        setNewPath('/mnt/tank/')
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon color="primary" /> SMB / CIFS Shares
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    disabled={loading}
                >
                    Criar Share
                </Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#eee' }}>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Caminho ZFS</strong></TableCell>
                            <TableCell><strong>Opções</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shares.map((share) => (
                            <TableRow key={share.name} hover>
                                <TableCell>{share.name}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{share.path}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {share.guest_ok && <Chip label="Guest OK" size="small" color="success" variant="outlined" />}
                                        {share.read_only && <Chip label="Read Only" size="small" color="warning" variant="outlined" />}
                                        {!share.guest_ok && !share.read_only && <Typography variant="caption" color="text.secondary">-</Typography>}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label="Online" size="small" color="success" sx={{ height: 20 }} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && shares.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    Nenhum compartilhamento encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Criação */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Novo Compartilhamento SMB</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nome do Compartilhamento"
                            fullWidth
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="ex: financeiro"
                        />
                        <TextField
                            label="Caminho (Dataset ZFS)"
                            fullWidth
                            value={newPath}
                            onChange={(e) => setNewPath(e.target.value)}
                            helperText="Caminho absoluto do mountpoint"
                        />
                        <FormControlLabel
                            control={<Switch checked={guestOk} onChange={(e) => setGuestOk(e.target.checked)} />}
                            label="Permitir Acesso Convidado (Guest OK)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!newName || !newPath}>
                        Criar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
EOF

# Routes (Enhanced)
cat >ui/src/routes/index.tsx <<'EOF'
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '../components/Dashboard'
import { SmbManager } from '../components/SmbManager'

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/smb" element={<SmbManager />} />
            <Route path="*" element={<Dashboard />} />
        </Routes>
    )
}
EOF

# Enhanced App Component (Barry + Master Validations)
cat >ui/src/App.tsx <<'EOF'
// ARQUIVO: ganache/ui/src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'
import { AppRoutes } from './routes'

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* Header Proxmox-Style */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#333' }}>
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
              GANACHE <Typography component="span" variant="caption" sx={{ color: '#E57000', fontWeight: 'bold', fontSize: '0.8rem' }}>NAS</Typography>
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
          <AppRoutes />
        </Container>
        
        {/* Footer */}
        <Box sx={{ p: 2, bgcolor: '#e0e0e0', textAlign: 'center', mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            Ganache Enterprise NAS - v1.0.0 (Frontend Prototype)
          </Typography>
        </Box>
      </Box>
    </BrowserRouter>
  )
}

export default App
EOF

# Enhanced main.tsx
cat >ui/src/main.tsx <<'EOF'
// ARQUIVO: ganache/ui/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

// Tema Proxmox-like (Sóbrio)
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#E57000' }, // Proxmox Orange
        background: { default: '#f5f5f5' }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: { backgroundColor: '#333' } // Dark Header
            }
        }
    }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
)
EOF

print_success "Enhanced React frontend created with all validations"

# 5. ENHANCED DEBIAN PACKAGING (Winston Architecture)
print_step "Creating enhanced Debian packaging templates..."
cat >debian/control <<'EOF'
Source: ganache
Section: admin
Priority: optional
Maintainer: Ganache Team <team@ganache.org>
Build-Depends: 
    debhelper (>= 12),
    rustc,
    cargo,
    nodejs,
    npm
Standards-Version: 4.5.1
Homepage: https://github.com/ganache/nas

Package: ganache-server
Architecture: amd64
Depends: ${shlibs:Depends}, ${misc:Depends}, systemd
Description: Ganache Enterprise NAS Server
 Enterprise NAS distribution based on Proxmox Backup Server.
 This package provides the core Ganache API server and storage services.

Package: ganache-web
Architecture: all
Depends: ${misc:Depends}, nginx | apache2
Description: Ganache Enterprise NAS Web Interface
 Web interface for managing Ganache Enterprise NAS.
 This package provides the React-based web interface and static assets.

Package: ganache
Architecture: amd64
Depends: ${shlibs:Depends}, ${misc:Depends}, ganache-server, ganache-web
Description: Ganache Enterprise NAS (Meta Package)
 Complete Ganache Enterprise NAS distribution.
 Meta-package that depends on all Ganache components for easy installation.
EOF

cat >debian/rules <<'EOF'
#!/usr/bin/make -f

# See debhelper(7) (uncomment to enable)
# output every command that modifies files on the build system.
#export DH_VERBOSE = 1

# see FEATURE AREAS in dpkg-buildflags(1) (but note that disables
# hardening, and is less suitable for empirical testing).
#export DEB_BUILD_MAINT_OPTIONS = hardening=+all

# see ENVIRONMENT in dpkg-buildflags(1)
# for details and further possibilities.

# Honour F80 (no RPATH for foo)
#export DEB_LDFLAGS_MAINT_APPEND = -Wl,--no-as-needed

%:
	dh $@

# dh_make generated override targets
# This is example for Cmake (See https://bugs.debian.org/641051 )
#override_dh_auto_configure:
#	dh_auto_configure -- \
#	-DCMAKE_LIBRARY_PATH=$(DEB_HOST_MULTIARCH)

override_dh_auto_build:
	# Build Rust backend
	cd src && cargo build --release
	# Build Frontend
	cd ui && npm ci && npm run build

override_dh_auto_install:
	# Install backend
	mkdir -p debian/ganache-server/usr/sbin
	cp src/target/release/ganache-api debian/ganache-server/usr/sbin/
	# Install frontend
	mkdir -p debian/ganache-web/usr/share/ganache/www
	cp -r ui/dist/* debian/ganache-web/usr/share/ganache/www/
EOF

cat >debian/ganache-server.install <<'EOF'
usr/sbin/ganache-api
EOF

cat >debian/ganache-web.install <<'EOF'
usr/share/ganache/www/
EOF

print_success "Enhanced Debian packaging templates created"

# 6. ENHANCED MAKEFILE (Master Validations)
print_step "Creating enhanced Makefile with build orchestration..."
cat >Makefile <<'EOF'
# Ganache Enterprise NAS - Enhanced Build System
# Incorporating Winston Architecture + Barry Implementation + Master Validations

.PHONY: all build ui deb clean dev setup help

# Default target
all: setup build

# Setup development environment
setup:
	@echo "🚀 Setting up Ganache development environment..."
	@cd ui && npm install
	@echo "✅ Setup completed!"

# Build everything
build: ui
	@echo "🔨 Building complete Ganache project..."
	@cd src && cargo build --release
	@echo "✅ Build completed!"

# Build frontend only
ui:
	@echo "⚛️ Building React frontend..."
	@cd ui && npm run api:gen && npm run build
	@echo "✅ Frontend build completed!"

# Build Debian packages
deb:
	@echo "📦 Building Debian packages..."
	@dpkg-buildpackage -us -uc -b
	@echo "✅ Debian packages built!"

# Development mode
dev: setup
	@echo "🚀 Starting development mode..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@cd ui && npm run dev

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@cd src && cargo clean
	@cd ui && rm -rf dist node_modules
	@rm -rf debian/.debhelper
	@echo "✅ Clean completed!"

# Generate API types
api-types:
	@echo "📜 Generating API types..."
	@cd ui && npm run api:gen
	@echo "✅ API types generated!"

# Type check
type-check:
	@echo "🔍 Running type checks..."
	@cd ui && npm run type-check
	@echo "✅ Type check completed!"

# Lint code
lint:
	@echo "🔍 Linting code..."
	@cd ui && npm run lint
	@echo "✅ Linting completed!"

# Help target
help:
	@echo "Ganache Enterprise NAS - Available targets:"
	@echo "  setup     - Setup development environment"
	@echo "  build     - Build complete project"
	@echo "  ui        - Build frontend only"
	@echo "  deb       - Build Debian packages"
	@echo "  dev       - Start development mode"
	@echo "  clean     - Clean build artifacts"
	@echo "  api-types - Generate API types"
	@echo "  type-check- Run TypeScript checks"
	@echo "  lint      - Lint code"
	@echo "  help      - Show this help"
EOF

# 7. Generate initial API schema (empty for now, will be filled by npm run api:gen)
touch ui/src/api/schema.d.ts

print_success "Enhanced Makefile created with build orchestration"

# 8. Final setup instructions
echo ""
echo "🎉 GANACHE ENHANCED REPOSITORY SETUP COMPLETED!"
echo ""
echo -e "${GREEN}✅ Project Structure Created:${NC}"
echo "   📁 ganache/"
echo "   ├── 📄 api-spec.yaml (Enhanced with ZFS)"
echo "   ├── 📄 Cargo.toml (Workspace - 4 crates)"
echo "   ├── 📄 Makefile (Enhanced build system)"
echo "   ├── 📁 src/ (Modular Rust backend)"
echo "   ├── 📁 ui/ (Enhanced React frontend)"
echo "   └── 📁 debian/ (Complete packaging)"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Setup development environment:"
echo "   cd ganache && make setup"
echo ""
echo "2. Start development mode:"
echo "   make dev"
echo ""
echo "3. Generate API types:"
echo "   make api-types"
echo ""
echo "4. Build for production:"
echo "   make build"
echo ""
echo -e "${YELLOW}📚 Features Included:${NC}"
echo "   ✅ Winston Architecture (Modular backend)"
echo "   ✅ Barry Implementation (SMB + Dashboard)"
echo "   ✅ Master Validations (OpenAPI + TypeScript)"
echo "   ✅ Enhanced ZFS Support"
echo "   ✅ Debian Packaging"
echo "   ✅ Build System Orchestration"
echo ""
echo -e "${GREEN}🎯 Ready for Backend Development!${NC}"
