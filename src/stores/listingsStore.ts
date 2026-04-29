import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockListings } from '@/data/mock'
import type { Listing, ListingImage } from '@/types'
import { useAuthStore } from './authStore'

interface ListingsState {
  listings: Listing[]
  _seeded: boolean
  addListing: (data: CreateListingInput) => Listing
  updateListing: (id: number, data: Partial<CreateListingInput>) => Listing | null
  deleteListing: (id: number) => void
  getById: (id: number) => Listing | undefined
}

export interface CreateListingInput {
  category_id: number
  title: string
  description: string
  condition: 'new' | 'used' | 'refurbished'
  price: number
  location_city: string
  location_state: string
  location_suburb?: string
  location_lat?: number
  location_lng?: number
  imageUrls: string[]
  videoUrl?: string | null
}

let nextId = 100
let nextImageId = 200

function buildImages(urls: string[]): ListingImage[] {
  return urls.map((url, i) => ({
    id: nextImageId++,
    image_url: url,
    processed_image_url: null,
    is_primary: i === 0,
    sort_order: i,
  }))
}

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      _seeded: false,

      addListing: (data) => {
        const user = useAuthStore.getState().user
        const now = new Date().toISOString()
        const listing: Listing = {
          id: nextId++,
          user_id: user?.id ?? 1,
          category_id: data.category_id,
          title: data.title,
          description: data.description,
          price: data.price,
          currency: 'ZAR',
          location_city: data.location_city,
          location_state: data.location_state,
          location_suburb: data.location_suburb,
          location_lat: data.location_lat,
          location_lng: data.location_lng,
          condition: data.condition,
          status: 'active',
          video_url: data.videoUrl ?? null,
          video_thumbnail_url: null,
          views_count: 0,
          images: buildImages(data.imageUrls),
          seller: user ?? undefined,
          is_favorited: false,
          created_at: now,
          updated_at: now,
        }
        set((s) => ({ listings: [listing, ...s.listings] }))
        return listing
      },

      updateListing: (id, data) => {
        const state = get()
        const idx = state.listings.findIndex((l) => l.id === id)
        if (idx === -1) return null
        const existing = state.listings[idx]
        const updated: Listing = {
          ...existing,
          ...(data.category_id !== undefined && { category_id: data.category_id }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.condition !== undefined && { condition: data.condition }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.location_city !== undefined && { location_city: data.location_city }),
          ...(data.location_state !== undefined && { location_state: data.location_state }),
          ...(data.location_suburb !== undefined && { location_suburb: data.location_suburb }),
          ...(data.location_lat !== undefined && { location_lat: data.location_lat }),
          ...(data.location_lng !== undefined && { location_lng: data.location_lng }),
          ...(data.imageUrls !== undefined && { images: buildImages(data.imageUrls) }),
          ...(data.videoUrl !== undefined && { video_url: data.videoUrl ?? null }),
          updated_at: new Date().toISOString(),
        }
        const newListings = [...state.listings]
        newListings[idx] = updated
        set({ listings: newListings })
        return updated
      },

      deleteListing: (id) => {
        set((s) => ({ listings: s.listings.filter((l) => l.id !== id) }))
      },

      getById: (id) => {
        return get().listings.find((l) => l.id === id)
      },
    }),
    {
      name: 'tradeflex-listings',
      onRehydrateStorage: () => {
        return (state: ListingsState | undefined) => {
          if (state && !state._seeded) {
            state.listings = [...mockListings]
            state._seeded = true
          }
          // Ensure nextId is above any existing ids
          if (state) {
            const maxId = Math.max(0, ...state.listings.map((l: Listing) => l.id))
            const maxImgId = Math.max(0, ...state.listings.flatMap((l: Listing) => l.images.map((i: ListingImage) => i.id)))
            nextId = maxId + 1
            nextImageId = maxImgId + 1
          }
        }
      },
    },
  ),
)
