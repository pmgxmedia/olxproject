import { useParams } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { useCategoryBySlug } from '@/hooks/useCategories'
import { useListings } from '@/hooks/useListings'
import SearchFilters from '@/components/listings/SearchFilters'
import ListingGrid from '@/components/listings/ListingGrid'
import { LoadingSpinner, EmptyState } from '@/components/common/Shared'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [params] = useSearchParams()
  const { data: category } = useCategoryBySlug(slug ?? '')

  const { data, isLoading } = useListings({
    category_id: category?.id,
    min_price: params.get('min_price') ? Number(params.get('min_price')) : undefined,
    max_price: params.get('max_price') ? Number(params.get('max_price')) : undefined,
    condition: params.get('condition') ?? undefined,
    sort_by: (params.get('sort_by') as 'newest' | 'price_asc' | 'price_desc') ?? 'newest',
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Home &gt; {category?.name ?? slug}</p>
        <h1 className="text-xl font-bold text-[#002f34] mt-1">{category?.name ?? 'Category'}</h1>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <SearchFilters />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : data?.data?.length ? (
            <ListingGrid listings={data.data} />
          ) : (
            <EmptyState title="No listings in this category" description="Check back later or browse other categories" />
          )}
        </div>
      </div>
    </div>
  )
}
