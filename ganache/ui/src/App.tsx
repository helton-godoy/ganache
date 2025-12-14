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
