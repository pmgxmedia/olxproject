import {
  Car, Smartphone, Home, Sofa, Shirt, Dumbbell, Wrench, Baby, Briefcase,
} from 'lucide-react'
import type { Category } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  car: Car, smartphone: Smartphone, home: Home, sofa: Sofa,
  shirt: Shirt, dumbbell: Dumbbell, wrench: Wrench, baby: Baby,
  briefcase: Briefcase, building: Home, monitor: Smartphone,
  tv: Smartphone, bike: Car,
}

interface CategoryCardProps {
  category: Category
  onSelect?: () => void
  selected?: boolean
  variant?: 'grid' | 'chip'
}

export default function CategoryCard({ category, onSelect, selected, variant = 'grid' }: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? Briefcase

  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
          selected
            ? 'bg-[#002f34] border-[#002f34] text-white'
            : 'bg-white border-gray-200 hover:border-[#23e5db] text-[#002f34]'
        }`}
      >
        <Icon size={16} className={selected ? 'text-[#23e5db]' : 'text-gray-500'} />
        <span className="text-sm font-medium">{category.name}</span>
        {category.listing_count !== undefined && (
          <span className={`text-xs ${selected ? 'text-gray-300' : 'text-gray-400'}`}>
            ({category.listing_count})
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all group cursor-pointer w-full ${
        selected
          ? 'bg-[#002f34] border-[#002f34] shadow-md'
          : 'bg-white border-gray-100 hover:shadow-md hover:border-[#23e5db]'
      }`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
        selected ? 'bg-[#23e5db]/20' : 'bg-[#f2f4f5] group-hover:bg-[#23e5db]/10'
      }`}>
        <Icon size={24} className={selected ? 'text-[#23e5db]' : 'text-[#002f34]'} />
      </div>
      <span className={`text-xs font-medium text-center leading-tight ${
        selected ? 'text-white' : 'text-[#002f34]'
      }`}>
        {category.name}
      </span>
      {category.listing_count !== undefined && (
        <span className={`text-xs ${selected ? 'text-gray-300' : 'text-gray-400'}`}>
          {category.listing_count} ads
        </span>
      )}
    </button>
  )
}