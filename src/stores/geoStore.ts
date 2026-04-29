import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GeoCoords {
  lat: number
  lng: number
}

export interface BuyerLocation {
  coords: GeoCoords
  city: string
  suburb: string
  province: string
}

interface GeoState {
  location: BuyerLocation | null
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'error'
  errorMessage: string | null
  requestLocation: () => void
  setLocation: (loc: BuyerLocation) => void
  clearLocation: () => void
}

export const useGeoStore = create<GeoState>()(
  persist(
    (set, _get) => ({
      location: null,
      status: 'idle',
      errorMessage: null,

      requestLocation: () => {
        if (!navigator.geolocation) {
          set({ status: 'error', errorMessage: 'Geolocation not supported by your browser' })
          return
        }

        set({ status: 'loading', errorMessage: null })

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            try {
              const loc = await reverseGeocode(latitude, longitude)
              set({ location: loc, status: 'granted' })
            } catch {
              // Fallback: use coords without name
              set({
                location: {
                  coords: { lat: latitude, lng: longitude },
                  city: 'Unknown',
                  suburb: '',
                  province: '',
                },
                status: 'granted',
              })
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              set({ status: 'denied', errorMessage: 'Location permission denied' })
            } else {
              set({ status: 'error', errorMessage: err.message })
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        )
      },

      setLocation: (loc) => set({ location: loc, status: 'granted' }),
      clearLocation: () => set({ location: null, status: 'idle', errorMessage: null }),
    }),
    {
      name: 'tradeflex-geo',
      partialize: (state) => ({
        location: state.location,
        status: state.status === 'granted' ? 'granted' : 'idle',
      }),
    },
  ),
)

/**
 * Reverse geocode coordinates to a human-readable South African address
 * using the free OpenStreetMap Nominatim API.
 */
async function reverseGeocode(lat: number, lng: number): Promise<BuyerLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TradeFlex/1.0' },
  })

  if (!res.ok) throw new Error('Geocoding request failed')

  const data = await res.json()
  const addr = data.address ?? {}

  const suburb = addr.suburb ?? addr.neighbourhood ?? addr.hamlet ?? addr.village ?? ''
  const city =
    addr.city ?? addr.town ?? addr.municipality ?? addr.county ?? 'Unknown'
  const province = addr.state ?? addr.region ?? ''

  return {
    coords: { lat, lng },
    city,
    suburb,
    province,
  }
}

// ─── Distance helpers ────────────────────────────────────────

/**
 * Haversine distance between two points (km).
 */
export function haversineKm(a: GeoCoords, b: GeoCoords): number {
  const R = 6371 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Human-friendly distance label.
 */
export function formatDistance(km: number): string {
  if (km < 1) return '< 1 km away'
  if (km < 10) return `${km.toFixed(1)} km away`
  if (km < 100) return `${Math.round(km)} km away`
  return `${Math.round(km)} km away`
}
