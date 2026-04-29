import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useAdminListings() {
  return useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      const { data } = await api.get<any[]>('/admin/listings')
      return data
    },
  })
}

export function useApproveListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (listingId: number) => {
      const { data } = await api.patch(`/admin/listings/${listingId}/approve`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
  })
}

export function useRejectListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (listingId: number) => {
      const { data } = await api.patch(`/admin/listings/${listingId}/reject`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
  })
}

export function useDeleteListingAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (listingId: number) => {
      const { data } = await api.delete(`/listings/${listingId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
  })
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics')
      return data
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users')
      return data
    },
  })
}

export function useBlockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch(`/admin/users/${userId}/block`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
  })
}

export function useUnblockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch(`/admin/users/${userId}/unblock`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
  })
}

export function useAdminEnquiries() {
  return useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: async () => {
      const { data } = await api.get('/admin/enquiries')
      return data
    },
  })
}

export function useMarkEnquiryRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enquiryId: number) => {
      const { data } = await api.patch(`/admin/enquiries/${enquiryId}/read`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] })
    },
  })
}