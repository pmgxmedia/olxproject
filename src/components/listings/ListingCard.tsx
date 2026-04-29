import { Link } from 'react-router-dom'
import { Heart, Video, MapPin } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import DistanceBadge from '@/components/common/DistanceBadge'
import type { Listing } from '@/types'

export default function ListingCard({ listing }: { listing: Listing }) {
  const primaryImage = listing.images.find((i) => i.is_primary) ?? listing.images[0]

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={primaryImage?.image_url}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            size={16}
            className={listing.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
        {/* Video badge */}
        {listing.video_url && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Video size={12} />
            Video
          </div>
        )}
        {/* Condition badge */}
        {listing.condition === 'new' && (
          <div className="absolute top-2 left-2 bg-[#23e5db] text-[#002f34] text-xs font-bold px-2 py-0.5 rounded">
            NEW
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-lg font-bold text-[#002f34] leading-tight">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <p className="text-sm text-gray-700 mt-1 line-clamp-1">{listing.title}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <MapPin size={12} />
          <span className="truncate">
            {listing.location_suburb ? `${listing.location_suburb}, ` : ''}{listing.location_city}
          </span>
          <DistanceBadge listing={listing} className="ml-auto flex-shrink-0" />
          {!listing.location_lat && (
            <span className="ml-auto">{timeAgo(listing.created_at)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
