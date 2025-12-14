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
