import { Users, ShoppingBag, Eye, TrendingUp, Clock, MessageSquare } from 'lucide-react'
import { useAdminAnalytics, useAdminListings, useAdminEnquiries } from '@/hooks/useAdmin'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { data: analytics } = useAdminAnalytics()
  const { data: listings = [] } = useAdminListings()
  const { data: enquiries = [] } = useAdminEnquiries()

  const totalUsers = analytics?.total_users ?? 0
  const totalListings = analytics?.total_listings ?? 0
  const activeListings = analytics?.active_listings ?? 0
  const pendingListings = analytics?.pending_listings ?? 0
  const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0)
  const newEnquiries = enquiries.filter((e: any) => e.status === 'unread').length

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { label: 'Total Listings', value: totalListings, icon: ShoppingBag, color: 'bg-green-50 text-green-600', link: '/admin/listings' },
    { label: 'Pending Approval', value: pendingListings, icon: Clock, color: 'bg-yellow-50 text-yellow-600', link: '/admin/listings' },
    { label: 'New Enquiries', value: newEnquiries, icon: MessageSquare, color: 'bg-orange-50 text-orange-600', link: '/admin/enquiries' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Listings', value: activeListings, icon: TrendingUp, color: 'bg-teal-50 text-teal-600', link: '/admin/listings' },
  ]

  const recentListings = [...listings]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const recentEnquiries = [...enquiries]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002f34]">Dashboard Overview</h2>
        <span className="text-sm text-gray-500">Master Admin</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const inner = (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#002f34]">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          )
          return stat.link ? (
            <Link key={stat.label} to={stat.link} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              {inner}
            </Link>
          ) : (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
              {inner}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-[#002f34] flex items-center gap-2">
              <MessageSquare size={16} className="text-orange-500" />
              Recent Enquiries
            </h3>
            <Link to="/admin/enquiries" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentEnquiries.map((eq: any) => (
              <div key={eq.id} className="px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#002f34]">{eq.sender_name}</span>
                  <EnquiryStatusBadge status={eq.status} />
                </div>
                <p className="text-xs text-gray-500 truncate">{eq.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">Re: {eq.listing_title}</p>
              </div>
            ))}
            {recentEnquiries.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No enquiries yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-[#002f34]">Recent Listings</h3>
            <Link to="/admin/listings" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentListings.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-[#002f34] max-w-[200px] truncate">{listing.title}</td>
                    <td className="px-5 py-3"><StatusBadge status={listing.status} /></td>
                    <td className="px-5 py-3 text-gray-600">R {listing.price?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {analytics?.listings_by_category && analytics.listings_by_category.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-[#002f34]">Listings by Category</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.listings_by_category.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{cat.category}</span>
                  <span className="font-semibold text-[#002f34]">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pendingListings > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-yellow-600" />
              <div>
                <p className="font-semibold text-[#002f34]">{pendingListings} listing{pendingListings !== 1 ? 's' : ''} pending approval</p>
                <p className="text-sm text-gray-600">Review and approve or reject submitted listings.</p>
              </div>
            </div>
            <Link
              to="/admin/listings"
              className="px-4 py-2 bg-[#002f34] text-white text-sm font-medium rounded-lg hover:bg-[#003a40] transition-colors"
            >
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function EnquiryStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    unread: 'bg-blue-100 text-blue-700',
    read: 'bg-yellow-100 text-yellow-700',
    replied: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}