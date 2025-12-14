import React, { useEffect } from 'react';
import { useWizardStore } from '../../stores/useWizardStore';
import { Box, Container, Stepper, Step, StepLabel, Typography, Paper, Button, CircularProgress } from '@mui/material';

interface WizardLayoutProps {
    children: React.ReactNode;
    title: string;
}

const steps = ['Hardware Scan', 'Disk Selection', 'Network & Confirm'];

export const WizardLayout: React.FC<WizardLayoutProps> = ({ children, title }) => {
    const { currentStep, scanHardware, loading, setStep } = useWizardStore();

    useEffect(() => {
        if (currentStep === 0) scanHardware();
    }, []);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        Ganache Installer
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Enterprise NAS Setup - Step {currentStep + 1}
                    </Typography>
                </Box>

                {/* Progress */}
                <Box sx={{ width: '100%', mb: 6 }}>
                    <Stepper activeStep={currentStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Content */}
                <Box sx={{ minHeight: '300px', mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        {title}
                    </Typography>

                    {loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="200px">
                            <CircularProgress size={60} />
                            <Typography variant="body1" sx={{ mt: 2 }}>Scanning Hardware...</Typography>
                        </Box>
                    ) : (
                        children
                    )}
                </Box>

                {/* Footer Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                        disabled={currentStep === 0}
                        onClick={() => setStep(Math.max(0, currentStep - 1))}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Box /> {/* Spacer for 'Next' button which is usually in the step content, or we can unify here */}
                </Box>
            </Paper>
        </Container>
    );
};
