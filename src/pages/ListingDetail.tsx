import { useParams, Link } from 'react-router-dom'
import { Heart, MapPin, Eye, Calendar, Phone, MessageCircle, Share2, Shield } from 'lucide-react'
import { useListing, useRelatedListings, useToggleFavorite } from '@/hooks/useListings'
import MediaCarousel from '@/components/media/MediaCarousel'
import ListingGrid from '@/components/listings/ListingGrid'
import DistanceBadge from '@/components/common/DistanceBadge'
import { LoadingSpinner } from '@/components/common/Shared'
import { formatPrice, timeAgo } from '@/lib/utils'
import { useState } from 'react'

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: listing, isLoading } = useListing(Number(id))
  const { data: related } = useRelatedListings(
    listing?.category_id ?? 0,
    listing?.id ?? 0,
  )
  const toggleFav = useToggleFavorite()
  const [showPhone, setShowPhone] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" />
  if (!listing) return <div className="text-center py-20 text-gray-500">Listing not found</div>

  const conditionColors = {
    new: 'bg-green-100 text-green-800',
    used: 'bg-yellow-100 text-yellow-800',
    refurbished: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-400 mb-4">
        <Link to="/" className="hover:text-[#23e5db]">Home</Link>
        {' > '}
        <Link to={`/category/${listing.category?.slug}`} className="hover:text-[#23e5db]">
          {listing.category?.name}
        </Link>
        {' > '}
        <span className="text-gray-600">{listing.title}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Media + Description */}
        <div className="lg:col-span-2 space-y-6">
          <MediaCarousel
            images={listing.images}
            videoUrl={listing.video_url}
            videoThumbnailUrl={listing.video_thumbnail_url}
            title={listing.title}
          />

          {/* Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#002f34]">{listing.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${conditionColors[listing.condition]}`}>
                    {listing.condition.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye size={14} />
                    {listing.views_count} views
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={14} />
                    {timeAgo(listing.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleFav.mutate(listing.id)}
                className="flex-shrink-0 w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
              >
                <Heart
                  size={20}
                  className={listing.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            </div>

            <p className="text-3xl font-extrabold text-[#002f34] mt-4">
              {formatPrice(listing.price, listing.currency)}
            </p>

            {/* Description */}
            <div className="mt-6">
              <h3 className="font-semibold text-[#002f34] mb-2">Description</h3>
              <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${!descExpanded ? 'line-clamp-4' : ''}`}>
                {listing.description}
              </p>
              {listing.description.length > 200 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-sm text-[#23e5db] mt-1 hover:underline"
                >
                  {descExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Location & Distance */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-[#002f34] mb-2 text-sm">Seller Location</h3>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#002f34]">
                    {listing.location_suburb ? `${listing.location_suburb}, ` : ''}
                    {listing.location_city}
                  </p>
                  <p className="text-xs text-gray-400">{listing.location_state}</p>
                </div>
              </div>
              <DistanceBadge
                listing={listing}
                className="mt-2 text-sm"
              />
            </div>

            {/* Share */}
            <div className="mt-4 flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#002f34]">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Right: Seller card */}
        <div className="space-y-4">
          {/* Price card (mobile) */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 lg:hidden">
            <p className="text-3xl font-extrabold text-[#002f34]">
              {formatPrice(listing.price, listing.currency)}
            </p>
          </div>

          {/* Seller */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#002f34] text-white rounded-full flex items-center justify-center text-lg font-bold">
                {listing.seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#002f34]">{listing.seller?.name}</p>
                <p className="text-xs text-gray-400">
                  Member since {new Date(listing.seller?.created_at ?? '').getFullYear()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full py-2.5 bg-[#002f34] text-white rounded-lg font-semibold text-sm hover:bg-[#003e45] transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                {showPhone ? listing.seller?.phone : 'Show Phone Number'}
              </button>
              <button className="w-full py-2.5 border-2 border-[#002f34] text-[#002f34] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <MessageCircle size={16} />
                Chat with Seller
              </button>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
              <Shield size={14} />
              <span>TradeFlex protects your transactions</span>
            </div>
          </div>

          {/* Safety tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-amber-800 mb-2">Safety Tips</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Meet in a public place</li>
              <li>• Don't pay in advance</li>
              <li>• Inspect the item before paying</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related listings */}
      {related && related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-[#002f34] mb-4">Related Listings</h2>
          <ListingGrid listings={related} />
        </section>
      )}
    </div>
  )
}
