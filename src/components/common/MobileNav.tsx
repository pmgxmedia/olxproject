import { Link, useLocation } from 'react-router-dom'
import { Home, Grid3x3, PlusCircle, Heart, User } from 'lucide-react'
import { classNames } from '@/lib/utils'

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/categories', icon: Grid3x3, label: 'Categories' },
  { to: '/post', icon: PlusCircle, label: 'Sell' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/my-account', icon: User, label: 'Account' },
]

export default function MobileNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const active = pathname === item.to
          const Icon = item.icon
          const isSell = item.label === 'Sell'
          return (
            <Link
              key={item.to}
              to={item.to}
              className={classNames(
                'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors',
                isSell && 'relative -top-3',
                active ? 'text-[#002f34]' : 'text-gray-400',
              )}
            >
              {isSell ? (
                <div className="w-12 h-12 rounded-full bg-[#002f34] text-white flex items-center justify-center shadow-lg">
                  <Icon size={24} />
                </div>
              ) : (
                <Icon size={22} />
              )}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
