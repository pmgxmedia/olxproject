import { Navigation } from 'lucide-react'
import { useGeoStore, haversineKm, formatDistance } from '@/stores/geoStore'
import type { Listing } from '@/types'

interface Props {
  listing: Listing
  className?: string
  showIcon?: boolean
}

/**
 * Shows the distance from the buyer's location to the listing.
 * If the buyer hasn't shared location or the listing lacks coords, returns null.
 */
export default function DistanceBadge({ listing, className = '', showIcon = true }: Props) {
  const buyerLocation = useGeoStore((s) => s.location)

  if (
    !buyerLocation ||
    listing.location_lat == null ||
    listing.location_lng == null
  ) {
    return null
  }

  const km = haversineKm(buyerLocation.coords, {
    lat: listing.location_lat,
    lng: listing.location_lng,
  })

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-[#23e5db] font-medium ${className}`}
      title={`Approximately ${Math.round(km)} km from your location`}
    >
      {showIcon && <Navigation size={11} className="rotate-45" />}
      {formatDistance(km)}
    </span>
  )
}
