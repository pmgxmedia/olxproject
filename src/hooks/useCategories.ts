import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Category } from '@/types'

export function useCategories(type?: 'items' | 'services' | 'jobs') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : ''
      const { data } = await api.get<Category[]>(`/categories${params}`)
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}
