import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronDown, Plus, User, LogOut, Loader2, LocateFixed, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useGeoStore } from '@/stores/geoStore'
import CurrencySelector from '@/components/common/CurrencySelector'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const authed = isAuthenticated()
  const { location: geoLocation, status: geoStatus, requestLocation } = useGeoStore()

  const locationLabel = geoLocation
    ? (geoLocation.suburb ? `${geoLocation.suburb}, ${geoLocation.city}` : geoLocation.city)
    : 'Set Location'
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#002f34]">Trade</span>
            <span className="text-[#23e5db]">Flex</span>
          </span>
        </Link>

        {/* Location selector */}
        <button
          onClick={requestLocation}
          className="hidden md:flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:border-[#002f34] transition-colors"
          title={geoStatus === 'denied' ? 'Location permission denied — enable in browser settings' : 'Detect your location'}
        >
          {geoStatus === 'loading' ? (
            <Loader2 size={16} className="animate-spin text-[#23e5db]" />
          ) : geoLocation ? (
            <LocateFixed size={16} className="text-[#23e5db]" />
          ) : (
            <MapPin size={16} />
          )}
          <span className="max-w-[140px] truncate">{locationLabel}</span>
          {!geoLocation && <ChevronDown size={14} />}
        </button>

        {/* Currency selector */}
        <div className="hidden md:block">
          <CurrencySelector />
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="flex border-2 border-[#002f34] rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find Cars, Mobile Phones and more..."
              className="flex-1 px-4 py-2 text-sm outline-none min-w-0"
            />
            <button
              type="submit"
              className="bg-[#002f34] text-white px-4 hover:bg-[#003e45] transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Auth / User */}
        <div className="hidden md:flex items-center gap-3">
          {authed ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-sm font-medium hover:text-[#23e5db] transition-colors"
              >
                <div className="w-8 h-8 bg-[#002f34] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
                <ChevronDown size={14} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
                  <Link
                    to="/my-account"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} className="inline mr-2" />
                    My Account
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm hover:bg-gray-50 text-purple-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield size={16} className="inline mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); navigate('/') }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                  >
                    <LogOut size={16} className="inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold hover:text-[#23e5db] transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm font-semibold hover:text-[#23e5db] transition-colors">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Sell button */}
        <Link
          to="/post"
          className="flex items-center gap-1.5 bg-white border-2 border-[#002f34] rounded-full px-5 py-2 text-sm font-bold hover:bg-[#002f34] hover:text-white transition-colors"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="hidden sm:inline">SELL</span>
        </Link>
      </div>
    </header>
  )
}
