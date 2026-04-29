import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types'

interface ProfileData {
  name?: string
  phone?: string
  location_city?: string
  location_state?: string
  avatar_url?: string
  bio?: string
}

export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me')
      setUser(data)
      return data
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  
  return useMutation({
    mutationFn: async (data: ProfileData) => {
      const { data: result } = await api.put<User>('/auth/profile', data)
      return result
    },
    onSuccess: (data) => {
      setUser(data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}