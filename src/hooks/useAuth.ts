import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { LoginPayload, RegisterPayload, User } from '@/types'

interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload)
      return data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        email: payload.email,
        name: payload.name,
        phone: payload.phone,
        password: payload.password,
      })
      return data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
    },
  })
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<{ id: number; name: string; email: string; phone: string; location_city: string; location_state: string; avatar_url: string | null; role: 'user' | 'admin'; status: 'active' | 'blocked'; created_at: string }>('/auth/me')
    return data as unknown as User
  } catch {
    return null
  }
}
