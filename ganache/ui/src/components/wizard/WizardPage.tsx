import React from 'react';
import { useWizardStore } from '../../stores/useWizardStore';
import { Step1ModeSelection } from './Step1ModeSelection';
import { Step2DiskSelection } from './Step2DiskSelection';
import { Box, Typography } from '@mui/material';

export const WizardPage: React.FC = () => {
    const { currentStep } = useWizardStore();

    switch (currentStep) {
        case 0:
            return <Step1ModeSelection />;
        case 1:
            return <Step2DiskSelection />;
        case 2:
            return (
                <Box p={4} textAlign="center">
                    <Typography variant="h5">Step 3: Network Configuration</Typography>
                    <Typography color="textSecondary">(Coming Soon)</Typography>
                </Box>
            );
        default:
            return <Step1ModeSelection />;
    }
};
