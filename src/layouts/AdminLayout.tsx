import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, FolderTree, Megaphone, LogOut, MessageSquare, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/listings', icon: ShoppingBag, label: 'Listings' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/promotions', icon: Megaphone, label: 'Promotions' },
  { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { to: '/admin/commission-ads', icon: DollarSign, label: 'Commission Ads' },
]

export default function AdminLayout() {
  const { user } = useAuthStore()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#002f34] text-white flex flex-col">
        <Link to="/admin" className="px-6 py-5 border-b border-white/10">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-white">Trade</span>
            <span className="text-[#23e5db]">Flex</span>
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">Admin Panel</span>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 bg-[#23e5db] text-[#002f34] rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-bold text-[#002f34]">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
