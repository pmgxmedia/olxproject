import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCategoryBySlug, useCategories } from '@/hooks/useCategories'
import { useListings } from '@/hooks/useListings'
import CategoryCard from '@/components/listings/CategoryCard'
import SearchFilters from '@/components/listings/SearchFilters'
import ListingGrid from '@/components/listings/ListingGrid'
import { LoadingSpinner, EmptyState } from '@/components/common/Shared'
import type { Category } from '@/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null)

  const { data: category } = useCategoryBySlug(slug ?? '')
  const { data: allCategories } = useCategories()

  const siblingCategories = allCategories?.filter(
    (cat) => cat.parent_id === category?.parent_id && cat.id !== category?.id
  ) ?? []

  const childCategories = category?.children ?? []

  const effectiveCategoryId = selectedSubCategory ?? category?.id

  const { data, isLoading } = useListings({
    category_id: effectiveCategoryId,
    min_price: params.get('min_price') ? Number(params.get('min_price')) : undefined,
    max_price: params.get('max_price') ? Number(params.get('max_price')) : undefined,
    condition: params.get('condition') ?? undefined,
    sort_by: (params.get('sort_by') as 'newest' | 'price_asc' | 'price_desc') ?? 'newest',
  })

  const handleSubCategorySelect = (catId: number | null) => {
    setSelectedSubCategory(catId)
  }

  const breadcrumbPath = buildBreadcrumbPath(allCategories, category)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#002f34] mb-3 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <p className="text-sm text-gray-400">
          <span
            className="cursor-pointer hover:text-gray-600"
            onClick={() => navigate('/')}
          >
            Home
          </span>
          {breadcrumbPath.map((crumb) => (
            <span key={crumb.slug}>
              {' > '}
              <span
                className={crumb.slug === slug ? 'text-[#002f34]' : 'cursor-pointer hover:text-gray-600'}
                onClick={() => crumb.slug && navigate(`/category/${crumb.slug}`)}
              >
                {crumb.name}
              </span>
            </span>
          ))}
        </p>
        <h1 className="text-xl font-bold text-[#002f34] mt-1">{category?.name ?? 'Category'}</h1>
        {category?.listing_count !== undefined && (
          <p className="text-sm text-gray-500 mt-1">{category.listing_count} active listings</p>
        )}
      </div>

      {childCategories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            <CategoryCard
              variant="chip"
              category={{
                id: category!.id,
                name: 'All',
                slug: category!.slug,
                icon: category!.icon,
                category_type: category!.category_type,
                parent_id: category!.parent_id,
                listing_count: category?.listing_count,
              }}
              selected={selectedSubCategory === null}
              onSelect={() => handleSubCategorySelect(null)}
            />
            {childCategories.map((child) => (
              <CategoryCard
                key={child.id}
                variant="chip"
                category={child}
                selected={selectedSubCategory === child.id}
                onSelect={() => handleSubCategorySelect(child.id)}
              />
            ))}
          </div>
        </div>
      )}

      {siblingCategories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Categories</h2>
          <div className="flex flex-wrap gap-2">
            {siblingCategories.map((sibling) => (
              <CategoryCard
                key={sibling.id}
                variant="chip"
                category={sibling}
                selected={false}
                onSelect={() => navigate(`/category/${sibling.slug}`)}
              />
            ))}
          </div>
        </div>
      )}

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
            <EmptyState
              title="No listings in this category"
              description="Check back later or browse other categories"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function buildBreadcrumbPath(
  allCategories: Category[] | undefined,
  currentCategory: Category | undefined
): { name: string; slug: string | null }[] {
  if (!currentCategory || !allCategories) return []

  const path: { name: string; slug: string | null }[] = []
  let current: Category | undefined = currentCategory

  while (current) {
    path.unshift({ name: current.name, slug: current.slug })
    if (current.parent_id) {
      current = allCategories.find((c) => c.id === current!.parent_id)
    } else {
      current = undefined
    }
  }

  return path.filter((p) => p.slug !== currentCategory?.slug)
}
