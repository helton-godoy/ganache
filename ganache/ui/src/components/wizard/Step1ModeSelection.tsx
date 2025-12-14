import React from 'react';
import { useWizardStore } from '../../stores/useWizardStore';
import { WizardLayout } from './WizardLayout';
import { Grid, Card, CardContent, Typography, Alert, AlertTitle, Box, Button, Chip } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import WarningIcon from '@mui/icons-material/Warning';

export const Step1ModeSelection: React.FC = () => {
    const { capabilities, selectedMode, selectMode, setStep } = useWizardStore();

    if (!capabilities) return null;

    return (
        <WizardLayout title="Storage Architecture Selection">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                {capabilities.has_hardware_raid && (
                    <Alert severity="warning" icon={<WarningIcon fontSize="inherit" />}>
                        <AlertTitle>Legacy Hardware Detected</AlertTitle>
                        This system appears to use a hardware RAID controller (e.g., PERC 6/i).
                        Native ZFS features are restricted to prevent data loss.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Option A: Legacy */}
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            onClick={() => selectMode('Legacy')}
                            sx={{
                                cursor: 'pointer',
                                borderColor: selectedMode === 'Legacy' ? 'primary.main' : undefined,
                                borderWidth: selectedMode === 'Legacy' ? 2 : 1,
                                bgcolor: selectedMode === 'Legacy' ? 'action.hover' : undefined
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box display="flex" alignItems="center">
                                        <DnsIcon sx={{ mr: 1, fontSize: 30 }} color="action" />
                                        <Typography variant="h6">Legacy HA Mode</Typography>
                                    </Box>
                                    {capabilities.recommended_mode === 'Legacy' && (
                                        <Chip label="Recommended" color="success" size="small" />
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Optimized for systems where Hardware RAID manages disk redundancy.
                                    Uses DRBD for network replication between nodes.
                                </Typography>

                                <Typography variant="caption" display="block">✅ Hardware RAID Compatible</Typography>
                                <Typography variant="caption" display="block">✅ DRBD Replication</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Option B: Native */}
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            onClick={() => !capabilities.has_hardware_raid && selectMode('Native')}
                            sx={{
                                cursor: capabilities.has_hardware_raid ? 'not-allowed' : 'pointer',
                                opacity: capabilities.has_hardware_raid ? 0.6 : 1,
                                borderColor: selectedMode === 'Native' ? 'primary.main' : undefined,
                                borderWidth: selectedMode === 'Native' ? 2 : 1
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box display="flex" alignItems="center">
                                        <StorageIcon sx={{ mr: 1, fontSize: 30 }} color="action" />
                                        <Typography variant="h6">Native ZFS Mode</Typography>
                                    </Box>
                                    {capabilities.recommended_mode === 'Native' && (
                                        <Chip label="Recommended" color="success" size="small" />
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Directly manages disks using ZFS RaidZ/Mirror.
                                    Requires HBA/JBoD (Direct Disk Access).
                                </Typography>

                                <Typography variant="caption" display="block">✅ Advanced ZFS Features</Typography>
                                <Typography variant="caption" display="block" color={capabilities.has_hardware_raid ? 'error' : 'text.primary'}>
                                    {capabilities.has_hardware_raid ? '⛔ Incompatible with RAID Card' : '✅ Direct Access Required'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                        variant="contained"
                        size="large"
                        disabled={!selectedMode}
                        onClick={() => setStep(1)}
                    >
                        Next: Select Disks
                    </Button>
                </Box>
            </Box>
        </WizardLayout>
    );
};
