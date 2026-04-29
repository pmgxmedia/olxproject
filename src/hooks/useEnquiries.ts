import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Enquiry {
  id: number
  listing_id: number
  listing_title: string | null
  sender_id: number
  sender_name: string | null
  sender_email: string | null
  message: string
  status: string
  created_at: string
}

interface EnquiryPayload {
  listing_id: number
  message: string
}

export function useEnquiries() {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const { data } = await api.get<Enquiry[]>('/enquiries/my-enquiries')
      return data
    },
  })
}

export function useSendEnquiry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EnquiryPayload) => {
      const { data } = await api.post<Enquiry>('/enquiries', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
    },
  })
}