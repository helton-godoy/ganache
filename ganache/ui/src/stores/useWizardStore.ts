import { create } from 'zustand'

export type StorageMode = 'Legacy' | 'Native'

export interface DiskInfo {
    path: string
    size_bytes: number
    model: string
    serial: string
    usable: boolean // True if not part of another raid/fs
}

export interface HardwareCapabilities {
    has_hardware_raid: boolean
    zfs_compatible_disks: DiskInfo[]
    drbd_available: boolean
    recommended_mode: StorageMode
}

interface WizardState {
    currentStep: number
    loading: boolean
    error: string | null

    // Data
    capabilities: HardwareCapabilities | null
    selectedMode: StorageMode | null
    selectedDisks: string[] // paths

    // Actions
    setStep: (step: number) => void
    selectMode: (mode: StorageMode) => void
    toggleDisk: (path: string) => void
    scanHardware: () => Promise<void>
}

// MOCK DATA GENERATOR
const mockScan = (): Promise<HardwareCapabilities> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                has_hardware_raid: true,
                drbd_available: true,
                recommended_mode: 'Legacy',
                zfs_compatible_disks: [
                    { path: '/dev/sda', size_bytes: 2000398934016, model: 'PERC 6/i Virtual Disk', serial: 'RAID-001', usable: false }, // System
                    { path: '/dev/sdb', size_bytes: 4000787030016, model: 'PERC 6/i Virtual Disk', serial: 'RAID-002', usable: true }
                ]
            })
        }, 1500)
    })
}

export const useWizardStore = create<WizardState>((set) => ({
    currentStep: 0,
    loading: false,
    error: null,
    capabilities: null,
    selectedMode: null,
    selectedDisks: [],

    setStep: (step) => set({ currentStep: step }),
    selectMode: (mode) => set({ selectedMode: mode }),
    toggleDisk: (path) => set((state) => {
        const exists = state.selectedDisks.includes(path)
        return {
            selectedDisks: exists
                ? state.selectedDisks.filter(d => d !== path)
                : [...state.selectedDisks, path]
        }
    }),

    scanHardware: async () => {
        set({ loading: true, error: null })
        try {
            // In real app: const data = await api.get('/hardware/scan')
            const data = await mockScan()
            set({
                capabilities: data,
                selectedMode: data.recommended_mode, // Auto-select recommended
                loading: false
            })
        } catch (err) {
            set({ error: "Failed to scan hardware", loading: false })
        }
    }
}))
