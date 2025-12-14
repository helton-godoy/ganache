// ARQUIVO: ganache/ui/src/mocks/handlers.ts
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
    })
]