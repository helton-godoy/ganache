import { create } from 'zustand'
import { smbApi, handleApiError } from '../api/client'
import type { components } from '../api/schema'

// Types from OpenAPI schema
type SmbShare = components['schemas']['SmbShare']
type SmbShareConfig = components['schemas']['SmbShareConfig']

interface SmbState {
    shares: SmbShare[]
    loading: boolean
    error: string | null
    fetchShares: () => Promise<void>
    createShare: (config: SmbShareConfig) => Promise<void>
    clearError: () => void
}

export const useSmbStore = create<SmbState>((set, get) => ({
    shares: [],
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchShares: async () => {
        set({ loading: true, error: null })
        try {
            const shares = await smbApi.getShares()
            set({ shares, loading: false })
        } catch (err) {
            const errorMessage = handleApiError(err)
            set({ error: errorMessage, loading: false })
        }
    },

    createShare: async (config) => {
        set({ loading: true, error: null })
        try {
            await smbApi.createShare(config)
            // Refresh the list after creation
            await get().fetchShares()
            set({ loading: false })
        } catch (err) {
            const errorMessage = handleApiError(err)
            set({ error: errorMessage, loading: false })
        }
    },
}))
