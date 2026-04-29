import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Listing, ListingFilters } from '@/types'

interface PaginatedListings {
  data: Listing[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category_id) params.append('category_id', String(filters.category_id))
      if (filters.min_price !== undefined) params.append('min_price', String(filters.min_price))
      if (filters.max_price !== undefined) params.append('max_price', String(filters.max_price))
      if (filters.condition) params.append('condition', filters.condition)
      if (filters.location) params.append('location', filters.location)
      if (filters.sort_by) params.append('sort_by', filters.sort_by)
      params.append('page', String(filters.page ?? 1))
      params.append('per_page', '12')
      
      const { data } = await api.get<PaginatedListings>(`/listings?${params.toString()}`)
      return data
    },
  })
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await api.get<Listing>(`/listings/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useRelatedListings(categoryId: number, excludeId: number) {
  return useQuery({
    queryKey: ['related-listings', categoryId, excludeId],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('category_id', String(categoryId))
      params.append('page', '1')
      params.append('per_page', '5')
      
      const { data } = await api.get<PaginatedListings>(`/listings?${params.toString()}`)
      return data.data.filter((l) => l.id !== excludeId).slice(0, 4)
    },
    enabled: !!categoryId,
  })
}

export function useMyListings(status?: string) {
  return useQuery({
    queryKey: ['my-listings', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.append('status', status)
      
      const { data } = await api.get<Listing[]>(`/listings/my-listings?${params.toString()}`)
      return data
    },
  })
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get<Listing[]>('/listings/favorites')
      return data
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (listingId: number) => {
      const { data } = await api.post<{ listing_id: number; favorited: boolean }>(`/listings/${listingId}/favorite`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['listing'] })
    },
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<Listing>('/listings', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Listing> }) => {
      const { data: result } = await api.put<Listing>(`/listings/${id}`, data)
      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] })
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/listings/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}
