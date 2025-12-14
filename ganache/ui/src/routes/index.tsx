import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '../components/Dashboard'
import { SmbManager } from '../components/SmbManager'
import { WizardPage } from '../components/wizard/WizardPage'

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/smb" element={<SmbManager />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="*" element={<Dashboard />} />
        </Routes>
    )
}
