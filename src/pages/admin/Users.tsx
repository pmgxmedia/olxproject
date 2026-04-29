import { useState } from 'react'
import { Search, Ban, CheckCircle, Eye, Mail, ShoppingBag } from 'lucide-react'
import { mockListings, mockEnquiries } from '@/data/mock'
import { useAdminUsers, useBlockUser, useUnblockUser } from '@/hooks/useAdmin'
import type { User } from '@/types'

export default function AdminUsers() {
  const { data: users = [], isLoading: loading } = useAdminUsers()
  const blockUser = useBlockUser()
  const unblockUser = useUnblockUser()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filtered = (users as User[]).filter((u: User) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  function toggleStatus(id: number, currentStatus: string) {
    if (currentStatus === 'active') {
      blockUser.mutate(id)
    } else {
      unblockUser.mutate(id)
    }
  }

  // Get user activity stats
  function getUserListings(userId: number) {
    return mockListings.filter((l) => l.user_id === userId)
  }
  function getUserEnquiries(userId: number) {
    return mockEnquiries.filter((e) => e.sender_id === userId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002f34]">Manage Users & Accounts</h2>
        <span className="text-sm text-gray-500">{filtered.length} accounts</span>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'user', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-[#002f34] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white rounded-lg border border-gray-200 overflow-x-auto ${selectedUser ? 'flex-1' : 'w-full'}`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Listings</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filtered.map((user: User) => {
                const userListings = getUserListings(user.id)
                return (
                  <tr key={user.id} className={`hover:bg-gray-50 cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedUser(user)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#23e5db] text-[#002f34] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#002f34]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{user.email}</td>
                    <td className="px-5 py-3 text-gray-600">{user.phone}</td>
                    <td className="px-5 py-3 text-gray-600">{user.location_city}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{userListings.length}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => toggleStatus(user.id, user.status)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              user.status === 'active'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <><Ban size={12} /> Block</>
                            ) : (
                              <><CheckCircle size={12} /> Unblock</>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
</tr>
                  )
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* User Detail Panel */}
        {selectedUser && (
          <div className="w-80 bg-white rounded-lg border border-gray-200 p-5 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#002f34]">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#23e5db] text-[#002f34] rounded-full flex items-center justify-center text-lg font-bold">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#002f34]">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.role === 'admin' ? 'Master Admin' : 'User'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} /> {selectedUser.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs">📱</span> {selectedUser.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs">📍</span> {selectedUser.location_city}, {selectedUser.location_state}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs">📅</span> Joined {new Date(selectedUser.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Activity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <ShoppingBag size={16} className="mx-auto text-green-600 mb-1" />
                  <p className="text-lg font-bold text-[#002f34]">{getUserListings(selectedUser.id).length}</p>
                  <p className="text-[11px] text-gray-500">Listings</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Mail size={16} className="mx-auto text-orange-600 mb-1" />
                  <p className="text-lg font-bold text-[#002f34]">{getUserEnquiries(selectedUser.id).length}</p>
                  <p className="text-[11px] text-gray-500">Enquiries</p>
                </div>
              </div>
            </div>

            {selectedUser.role !== 'admin' && (
              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={() => toggleStatus(selectedUser.id, selectedUser.status)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedUser.status === 'active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {selectedUser.status === 'active' ? (
                    <><Ban size={14} /> Block Account</>
                  ) : (
                    <><CheckCircle size={14} /> Unblock Account</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
