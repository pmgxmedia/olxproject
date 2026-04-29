import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash2, Package, Heart } from 'lucide-react'
import { useMyListings, useDeleteListing, useUpdateListing } from '@/hooks/useListings'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuthStore } from '@/stores/authStore'
import ListingGrid from '@/components/listings/ListingGrid'
import { LoadingSpinner, EmptyState } from '@/components/common/Shared'
import { formatPrice, timeAgo } from '@/lib/utils'

const statusFilters = ['all', 'active', 'pending', 'sold', 'rejected'] as const

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  sold: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700',
}

export default function Dashboard() {
  const [tab, setTab] = useState<'ads' | 'favorites'>('ads')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { data: myListings, isLoading: adsLoading } = useMyListings(statusFilter)
  const { data: favorites, isLoading: favLoading } = useFavorites()
  const deleteListing = useDeleteListing()
  const updateListing = useUpdateListing()

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-[#002f34] text-white rounded-full flex items-center justify-center text-xl font-bold">
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#002f34]">{user?.name ?? 'User'}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('ads')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'ads' ? 'border-[#002f34] text-[#002f34]' : 'border-transparent text-gray-500 hover:text-[#002f34]'
          }`}
        >
          <Package size={16} className="inline mr-1.5 -mt-0.5" />
          My Ads
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'favorites' ? 'border-[#002f34] text-[#002f34]' : 'border-transparent text-gray-500 hover:text-[#002f34]'
          }`}
        >
          <Heart size={16} className="inline mr-1.5 -mt-0.5" />
          Favorites
        </button>
      </div>

      {tab === 'ads' && (
        <>
          {/* Status filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-full border capitalize whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-[#002f34] text-white border-[#002f34]'
                    : 'border-gray-300 hover:border-[#002f34]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Listings table */}
          {adsLoading ? (
            <LoadingSpinner />
          ) : myListings?.length ? (
            <div className="space-y-3">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 items-center"
                >
                  <img
                    src={listing.images[0]?.image_url}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="font-medium text-[#002f34] hover:text-[#23e5db] line-clamp-1"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-lg font-bold text-[#002f34]">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[listing.status]}`}>
                        {listing.status}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye size={12} /> {listing.views_count}
                      </span>
                      <span>{timeAgo(listing.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => navigate(`/post?id=${listing.id}`)}
                      className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      <Edit2 size={14} className="text-gray-500" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this listing?')) {
                          setDeletingId(listing.id)
                          try {
                            await deleteListing.mutateAsync(listing.id)
                          } finally {
                            setDeletingId(null)
                          }
                        }
                      }}
                      disabled={deletingId === listing.id}
                      className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === listing.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} className="text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No listings yet"
              description="Start selling by posting your first ad"
              action={
                <Link
                  to="/post"
                  className="inline-block px-5 py-2 bg-[#002f34] text-white rounded-lg text-sm font-semibold hover:bg-[#003e45]"
                >
                  Post an Ad
                </Link>
              }
            />
          )}
        </>
      )}

      {tab === 'favorites' && (
        <>
          {favLoading ? (
            <LoadingSpinner />
          ) : favorites?.length ? (
            <ListingGrid listings={favorites} />
          ) : (
            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Save listings you're interested in to find them here"
              action={
                <Link
                  to="/search"
                  className="inline-block px-5 py-2 bg-[#002f34] text-white rounded-lg text-sm font-semibold hover:bg-[#003e45]"
                >
                  Browse Listings
                </Link>
              }
            />
          )}
        </>
      )}
    </div>
  )
}
