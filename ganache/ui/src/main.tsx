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
