import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

export default function SearchFilters({ onClose }: { onClose?: () => void }) {
  const [params, setParams] = useSearchParams()
  const { data: categories } = useCategories()

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  function clearAll() {
    setParams({})
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#002f34]">Filters</h3>
        <div className="flex items-center gap-2">
          <button onClick={clearAll} className="text-sm text-[#23e5db] hover:underline">
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="md:hidden">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={params.get('category_id') ?? ''}
          onChange={(e) => updateParam('category_id', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={params.get('min_price') ?? ''}
            onChange={(e) => updateParam('min_price', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={params.get('max_price') ?? ''}
            onChange={(e) => updateParam('max_price', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
        <div className="flex flex-wrap gap-2">
          {['new', 'used', 'refurbished'].map((c) => (
            <button
              key={c}
              onClick={() => updateParam('condition', params.get('condition') === c ? '' : c)}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                params.get('condition') === c
                  ? 'bg-[#002f34] text-white border-[#002f34]'
                  : 'border-gray-300 hover:border-[#002f34]'
              } transition-colors capitalize`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          placeholder="City or state"
          value={params.get('location') ?? ''}
          onChange={(e) => updateParam('location', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
        <select
          value={params.get('sort_by') ?? 'newest'}
          onChange={(e) => updateParam('sort_by', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
