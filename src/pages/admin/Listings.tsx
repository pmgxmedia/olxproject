import { useState } from 'react'
import { Search, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react'
import { useAdminListings, useApproveListing, useRejectListing, useDeleteListingAdmin } from '@/hooks/useAdmin'
import type { Listing } from '@/types'

const statusFilters = ['all', 'active', 'pending', 'sold', 'rejected', 'draft'] as const

export default function AdminListings() {
  const { data: listings = [], isLoading } = useAdminListings()
  const approveListing = useApproveListing()
  const rejectListing = useRejectListing()
  const deleteListing = useDeleteListingAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const filtered = (listings as any[]).filter((l: any) => {
    const matchSearch = !search || 
      l.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  function updateStatus(id: number, status: string) {
    if (status === 'active') {
      approveListing.mutate(id)
    } else if (status === 'rejected') {
      rejectListing.mutate(id)
    }
  }

  function handleDelete(id: number) {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteListing.mutate(id)
    }
  }

  const pendingCount = (listings as any[]).filter((l: any) => l.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#002f34]">Content Approval & Listings</h2>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-600 mt-0.5">{pendingCount} listing{pendingCount !== 1 ? 's' : ''} pending review</p>
          )}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} listings</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
        >
          {statusFilters.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Listing</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Price</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No listings found
                </td>
              </tr>
            ) : (
              filtered.map((listing: any) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[#002f34]">{listing.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {listing.location_city || 'No location'} • {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-semibold text-[#002f34]">
                      R {listing.price?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      listing.status === 'active' ? 'bg-green-100 text-green-700' :
                      listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      listing.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                      listing.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(listing.id, 'active')}
                            className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(listing.id, 'rejected')}
                            className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Listing Detail Panel */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedListing(null)}>
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#002f34]">Listing Details</h3>
                <button onClick={() => setSelectedListing(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Title</p>
                  <p className="font-medium text-[#002f34]">{selectedListing.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Price</p>
                    <p className="font-medium text-[#002f34]">R {selectedListing.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      selectedListing.status === 'active' ? 'bg-green-100 text-green-700' :
                      selectedListing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedListing.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Description</p>
                  <p className="text-sm text-gray-700">{selectedListing.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Location</p>
                    <p className="text-sm text-gray-700">{selectedListing.location_city}, {selectedListing.location_state}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Condition</p>
                    <p className="text-sm text-gray-700 capitalize">{selectedListing.condition}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Posted</p>
                  <p className="text-sm text-gray-700">{new Date(selectedListing.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  {selectedListing.status === 'pending' && (
                    <>
                      <button
                        onClick={() => { updateStatus(selectedListing.id, 'active'); setSelectedListing(null); }}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { updateStatus(selectedListing.id, 'rejected'); setSelectedListing(null); }}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(selectedListing.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}