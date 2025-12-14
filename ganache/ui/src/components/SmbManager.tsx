// ARQUIVO: ganache/ui/src/components/SmbManager.tsx
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