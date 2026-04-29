import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import { useListings } from '@/hooks/useListings'
import CategoryCard from '@/components/listings/CategoryCard'
import ListingGrid from '@/components/listings/ListingGrid'
import { LoadingSpinner } from '@/components/common/Shared'
import PromotionalCarousel from '@/components/common/PromotionalCarousel'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: listings, isLoading: listLoading } = useListings({ sort_by: 'newest' })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div>
      {/* Hero search */}
      <section className="bg-gradient-to-b from-[#002f34] to-[#003e45] py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Buy & Sell Anything
          </h1>
          <p className="text-[#23e5db] mb-6 text-sm md:text-base">
            Join millions of users on TradeFlex
          </p>
          <form onSubmit={handleSearch} className="flex bg-white rounded-lg overflow-hidden shadow-lg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What are you looking for?"
              className="flex-1 px-5 py-3.5 text-sm md:text-base outline-none"
            />
            <button
              type="submit"
              className="bg-[#23e5db] text-[#002f34] px-6 font-semibold hover:bg-[#1fd1c8] transition-colors"
            >
              <Search size={22} />
            </button>
          </form>
        </div>
      </section>

      {/* Promotional carousel — only renders if there are active promos */}
      <PromotionalCarousel />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-[#002f34] mb-4">Browse Categories</h2>
          {catLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {categories
                ?.filter((c) => !c.parent_id)
                .map((cat) => <CategoryCard key={cat.id} category={cat} onSelect={() => navigate(`/category/${cat.slug}`)} />)}
            </div>
          )}
        </section>

        {/* Fresh listings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#002f34]">Fresh Recommendations</h2>
            <Link to="/search" className="text-sm text-[#23e5db] hover:underline font-medium">
              View all
            </Link>
          </div>
          {listLoading ? (
            <LoadingSpinner />
          ) : listings?.data?.length ? (
            <ListingGrid listings={listings.data} />
          ) : (
            <p className="text-gray-400 text-center py-8">No listings yet</p>
          )}
        </section>
      </div>
    </div>
  )
}
