export interface User {
  id: number
  name: string
  email: string
  phone: string
  location_city: string
  location_state: string
  avatar_url: string | null
  role: 'user' | 'admin'
  status: 'active' | 'blocked'
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  category_type: 'items' | 'services' | 'jobs'
  parent_id: number | null
  children?: Category[]
  listing_count?: number
}

export interface ListingImage {
  id: number
  image_url: string
  processed_image_url: string | null
  is_primary: boolean
  sort_order: number
}

export interface Listing {
  id: number
  user_id: number
  category_id: number
  title: string
  description: string
  price: number
  currency: string
  location_city: string
  location_state: string
  location_suburb?: string
  location_lat?: number
  location_lng?: number
  condition: 'new' | 'used' | 'refurbished'
  status: 'draft' | 'pending' | 'active' | 'sold' | 'rejected'
  video_url: string | null
  video_thumbnail_url: string | null
  views_count: number
  images: ListingImage[]
  seller?: User
  category?: Category
  is_favorited?: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ListingFilters {
  search?: string
  category_id?: number
  min_price?: number
  max_price?: number
  condition?: string
  location?: string
  sort_by?: 'newest' | 'price_asc' | 'price_desc'
  page?: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}

export interface PostAdFormData {
  category_id: number
  title: string
  description: string
  condition: 'new' | 'used' | 'refurbished'
  price: number
  location_city: string
  location_state: string
  images: File[]
  processed_images: (Blob | null)[]
  video: File | null
}

export interface PromotionalAd {
  id: number
  title: string
  image_url: string
  link_url: string
  enabled: boolean
  sort_order: number
  created_at: string
}

export interface Enquiry {
  id: number
  listing_id: number
  listing_title: string
  sender_id: number
  sender_name: string
  sender_email: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
}

export interface CommissionAd {
  id: number
  advertiser_name: string
  advertiser_email: string
  title: string
  image_url: string
  link_url: string
  commission_rate: number
  clicks: number
  impressions: number
  revenue: number
  status: 'active' | 'paused' | 'expired'
  start_date: string
  end_date: string
  created_at: string
}

export interface VisitorStats {
  date: string
  visitors: number
  page_views: number
  signups: number
}

export type AdminPrivilege =
  | 'content_approval'
  | 'user_management'
  | 'enquiry_management'
  | 'promotions_management'
  | 'commission_management'
  | 'category_management'
  | 'analytics_view'
