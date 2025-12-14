import React from 'react';
import { useWizardStore } from '../../stores/useWizardStore';
import { WizardLayout } from './WizardLayout';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Checkbox, Typography, Button, Alert } from '@mui/material';
import HardDriveIcon from '@mui/icons-material/Storage'; // Using Storage as placeholder for HDD

export const Step2DiskSelection: React.FC = () => {
    const { capabilities, selectedDisks, toggleDisk, setStep, selectedMode } = useWizardStore();

    if (!capabilities) return null;

    const availableDisks = capabilities.zfs_compatible_disks;

    return (
        <WizardLayout title="Target Disk Selection">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                <Alert severity="info">
                    Operating in <strong>{selectedMode} Mode</strong>. Please select the disks to be claimed by Ganache.
                </Alert>

                <List sx={{ width: '100%', bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {availableDisks.map((disk) => {
                        const labelId = `checkbox-list-label-${disk.path}`;
                        const isSelected = selectedDisks.indexOf(disk.path) !== -1;

                        return (
                            <ListItem
                                key={disk.path}
                                disablePadding
                            >
                                <ListItemButton
                                    role={undefined}
                                    onClick={() => disk.usable && toggleDisk(disk.path)}
                                    dense
                                    disabled={!disk.usable}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={isSelected}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemIcon>
                                    <ListItemIcon>
                                        <HardDriveIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        id={labelId}
                                        primary={
                                            <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                                                {disk.path}
                                            </Typography>
                                        }
                                        secondary={`${disk.model} (${disk.serial})`}
                                    />
                                    <Box sx={{ textAlign: 'right', mr: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {(disk.size_bytes / 1024 / 1024 / 1024 / 1024).toFixed(2)} TB
                                        </Typography>
                                        {!disk.usable && (
                                            <Typography variant="caption" color="error">System / In Use</Typography>
                                        )}
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                        variant="contained"
                        size="large"
                        disabled={selectedDisks.length === 0}
                        onClick={() => setStep(2)}
                    >
                        Next: Configure Network
                    </Button>
                </Box>
            </Box>
        </WizardLayout>
    );
};
