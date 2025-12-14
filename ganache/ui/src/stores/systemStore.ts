import { create } from 'zustand'
import { systemApi, handleApiError } from '../api/client'
import type { components } from '../api/schema'

// Types from OpenAPI schema
type NodeStatus = components['schemas']['NodeStatus']

interface SystemState {
    status: NodeStatus | null
    loading: boolean
    error: string | null
    fetchStatus: () => Promise<void>
    clearError: () => void
}

export const useSystemStore = create<SystemState>((set) => ({
    status: null,
    loading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchStatus: async () => {
        set({ loading: true, error: null })
        try {
            const status = await systemApi.getStatus()
            set({ status, loading: false })
        } catch (err) {
            const errorMessage = handleApiError(err)
            set({ error: errorMessage, loading: false })
        }
    },
}))
