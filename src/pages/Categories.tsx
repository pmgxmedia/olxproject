import { useNavigate } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import CategoryCard from '@/components/listings/CategoryCard'
import { LoadingSpinner } from '@/components/common/Shared'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const { data: categories, isLoading } = useCategories()
  
  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" />
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#002f34] mb-6">All Categories</h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {categories?.map((cat) => (
          <CategoryCard 
            key={cat.id} 
            category={cat} 
            onSelect={() => navigate(`/category/${cat.slug}`)} 
          />
        ))}
      </div>
    </div>
  )
}
