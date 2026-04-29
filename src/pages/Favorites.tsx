import { useFavorites } from '@/hooks/useFavorites'
import ListingGrid from '@/components/listings/ListingGrid'
import { LoadingSpinner, EmptyState } from '@/components/common/Shared'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites()

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#002f34] mb-6">My Favorites</h1>
      {favorites?.length ? (
        <ListingGrid listings={favorites} />
      ) : (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart icon on any listing to save it here"
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
    </div>
  )
}
