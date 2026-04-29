import { useState, useRef } from 'react'
import { Search, Plus, Trash2, Play, Pause, DollarSign, BarChart3, MousePointer, Image } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import type { CommissionAd } from '@/types'

const statusFilters = ['all', 'active', 'paused', 'expired'] as const

export default function AdminCommissionAds() {
  const commissionAds = useAdminStore((s) => s.commissionAds)
  const addCommissionAd = useAdminStore((s) => s.addCommissionAd)
  const removeCommissionAd = useAdminStore((s) => s.removeCommissionAd)
  const toggleCommissionAdStatus = useAdminStore((s) => s.toggleCommissionAdStatus)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    advertiser_name: '',
    advertiser_email: '',
    title: '',
    link_url: '',
    commission_rate: 10,
    start_date: '',
    end_date: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = commissionAds.filter((a) => {
    const matchSearch =
      a.advertiser_name.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = commissionAds.reduce((sum, a) => sum + a.revenue, 0)
  const totalClicks = commissionAds.reduce((sum, a) => sum + a.clicks, 0)
  const totalImpressions = commissionAds.reduce((sum, a) => sum + a.impressions, 0)
  const activeCount = commissionAds.filter((a) => a.status === 'active').length

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleAdd() {
    if (!formData.advertiser_name.trim() || !formData.title.trim() || !imagePreview) return
    addCommissionAd({
      advertiser_name: formData.advertiser_name.trim(),
      advertiser_email: formData.advertiser_email.trim(),
      title: formData.title.trim(),
      image_url: imagePreview,
      link_url: formData.link_url.trim() || '#',
      commission_rate: formData.commission_rate,
      status: 'active',
      start_date: formData.start_date || new Date().toISOString().split('T')[0],
      end_date: formData.end_date || '',
    })
    resetForm()
  }

  function resetForm() {
    setFormData({
      advertiser_name: '',
      advertiser_email: '',
      title: '',
      link_url: '',
      commission_rate: 10,
      start_date: '',
      end_date: '',
    })
    setImagePreview(null)
    setShowForm(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#002f34]">Commission-Based Ads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {commissionAds.length} total &middot; {activeCount} active
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#002f34] text-white text-sm font-medium rounded-lg hover:bg-[#003a40] transition-colors"
        >
          <Plus size={16} />
          Add Commission Ad
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-[#002f34]">R {totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><MousePointer size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-[#002f34]">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Clicks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><BarChart3 size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-[#002f34]">{totalImpressions.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Impressions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><BarChart3 size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-[#002f34]">
                {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'}%
              </p>
              <p className="text-xs text-gray-500">Avg CTR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-[#002f34]">New Commission Ad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advertiser Name</label>
                <input
                  type="text"
                  value={formData.advertiser_name}
                  onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })}
                  placeholder="e.g. AutoTrader SA"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advertiser Email</label>
                <input
                  type="email"
                  value={formData.advertiser_email}
                  onChange={(e) => setFormData({ ...formData, advertiser_email: e.target.value })}
                  placeholder="ads@company.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Find Your Dream Car"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#002f34] file:text-white hover:file:bg-[#003a40] file:cursor-pointer"
                />
              </div>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
              ) : (
                <div className="w-full h-28 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <Image size={24} />
                  <span className="text-xs mt-1">Banner preview</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.advertiser_name.trim() || !formData.title.trim() || !imagePreview}
              className="px-4 py-2 bg-[#23e5db] text-[#002f34] text-sm font-medium rounded-lg hover:bg-[#1dd1c8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Commission Ad
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search ads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-[#002f34] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ads table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Advertiser</th>
              <th className="px-5 py-3 text-left">Ad Title</th>
              <th className="px-5 py-3 text-left">Rate</th>
              <th className="px-5 py-3 text-left">Clicks</th>
              <th className="px-5 py-3 text-left">Impressions</th>
              <th className="px-5 py-3 text-left">Revenue</th>
              <th className="px-5 py-3 text-left">Period</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-[#002f34]">{ad.advertiser_name}</p>
                    <p className="text-[11px] text-gray-400">{ad.advertiser_email}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{ad.title}</td>
                <td className="px-5 py-3 text-gray-600">{ad.commission_rate}%</td>
                <td className="px-5 py-3 text-gray-600">{ad.clicks.toLocaleString()}</td>
                <td className="px-5 py-3 text-gray-600">{ad.impressions.toLocaleString()}</td>
                <td className="px-5 py-3 font-medium text-emerald-600">R {ad.revenue.toLocaleString()}</td>
                <td className="px-5 py-3 text-gray-600 text-xs">
                  {ad.start_date} — {ad.end_date || '∞'}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={ad.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    {ad.status !== 'expired' && (
                      <button
                        onClick={() => toggleCommissionAdStatus(ad.id)}
                        className={`p-1.5 rounded transition-colors ${
                          ad.status === 'active'
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={ad.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {ad.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => removeCommissionAd(ad.id)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-gray-400">
                  No commission ads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}
