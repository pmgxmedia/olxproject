import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

interface UploadResponse {
  url: string
  filename: string
}

interface VideoUploadResponse {
  url: string
  thumbnail: string
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const { data } = await api.post<UploadResponse>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
  })
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const { data } = await api.post<VideoUploadResponse>('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
  })
}