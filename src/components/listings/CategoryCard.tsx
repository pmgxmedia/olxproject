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
}

export default function CategoryCard({ category, onSelect, selected }: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? Briefcase

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
    </button>
  )
}