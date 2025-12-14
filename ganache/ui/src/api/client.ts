import createClient from 'openapi-fetch'
import { paths } from './schema'

// Create typed client
export const api = createClient<paths>({
  baseUrl: '/api2/json',
})

// API helper functions
export const smbApi = {
  // List SMB shares
  getShares: async () => {
    const { data, error } = await api.GET('/ganache/smb/shares')
    if (error) throw new Error('Failed to fetch SMB shares')
    return data || []
  },

  // Create SMB share
  createShare: async (config: {
    name: string
    path: string
    guest_ok?: boolean
    timemachine?: boolean
  }) => {
    const { data, error } = await api.POST('/ganache/smb/shares', {
      body: config,
    })
    if (error) throw new Error('Failed to create SMB share')
    return data
  },
}

export const systemApi = {
  // Get system status
  getStatus: async () => {
    const { data, error } = await api.GET('/nodes/localhost/status')
    if (error) throw new Error('Failed to fetch system status')
    return data
  },
}

export const zfsApi = {
  // List ZFS pools (when implemented)
  getPools: async () => {
    try {
      const { data, error } = await api.GET('/ganache/storage/zfs')
      if (error) throw new Error('Failed to fetch ZFS pools')
      return data || []
    } catch (error) {
      // Return empty array if endpoint not implemented yet
      return []
    }
  },
}

// Error handling helper
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}
