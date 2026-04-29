import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useListings } from '@/hooks/useListings'
import SearchFilters from '@/components/listings/SearchFilters'
import ListingGrid from '@/components/listings/ListingGrid'
import { LoadingSpinner, EmptyState } from '@/components/common/Shared'
import type { ListingFilters } from '@/types'

export default function SearchPage() {
  const [params] = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filters: ListingFilters = {
    search: params.get('q') ?? undefined,
    category_id: params.get('category_id') ? Number(params.get('category_id')) : undefined,
    min_price: params.get('min_price') ? Number(params.get('min_price')) : undefined,
    max_price: params.get('max_price') ? Number(params.get('max_price')) : undefined,
    condition: params.get('condition') ?? undefined,
    location: params.get('location') ?? undefined,
    sort_by: (params.get('sort_by') as ListingFilters['sort_by']) ?? 'newest',
    page: params.get('page') ? Number(params.get('page')) : 1,
  }

  const { data, isLoading } = useListings(filters)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#002f34]">
            {filters.search ? `Results for "${filters.search}"` : 'All Listings'}
          </h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.total} result{data.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <SearchFilters />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : data?.data?.length ? (
            <ListingGrid listings={data.data} />
          ) : (
            <EmptyState title="No listings found" description="Try adjusting your filters or search terms" />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <SearchFilters onClose={() => setShowMobileFilters(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
