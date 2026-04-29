import { useState, useRef } from 'react'
import { Plus, Trash2, Eye, EyeOff, GripVertical, Image, ExternalLink } from 'lucide-react'
import { usePromotionsStore } from '@/stores/promotionsStore'

export default function AdminPromotions() {
  const { ads, addAd, removeAd, toggleAd } = usePromotionsStore()
  const sorted = [...ads].sort((a, b) => a.sort_order - b.sort_order)
  const enabledCount = ads.filter((a) => a.enabled).length

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleAdd() {
    if (!title.trim() || !imagePreview) return
    addAd({
      title: title.trim(),
      image_url: imagePreview,
      link_url: linkUrl.trim() || '#',
      enabled: true,
    })
    setTitle('')
    setLinkUrl('')
    setImagePreview(null)
    setShowForm(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function resetForm() {
    setTitle('')
    setLinkUrl('')
    setImagePreview(null)
    setShowForm(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#002f34]">Promotional Ads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {ads.length} total &middot; {enabledCount} active on homepage
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#002f34] text-white text-sm font-medium rounded-lg hover:bg-[#003a40] transition-colors"
        >
          <Plus size={16} />
          Add Promo
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-[#002f34]">New Promotional Ad</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Sale — 50% off Electronics"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                />
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
            </div>
            <div>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
              ) : (
                <div className="w-full h-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <Image size={32} />
                  <span className="text-xs mt-2">Image preview</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim() || !imagePreview}
              className="px-4 py-2 bg-[#23e5db] text-[#002f34] text-sm font-medium rounded-lg hover:bg-[#1dd1c8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Promotional Ad
            </button>
          </div>
        </div>
      )}

      {/* Ads list */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Image size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No promotional ads yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add your first promo ad to display a carousel on the homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ad) => (
            <div
              key={ad.id}
              className={`bg-white rounded-lg border flex items-center gap-4 p-4 transition-colors ${
                ad.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <GripVertical size={16} className="text-gray-300 flex-shrink-0 cursor-grab" />

              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-24 h-16 object-cover rounded flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#002f34] truncate">{ad.title}</p>
                {ad.link_url && ad.link_url !== '#' && (
                  <a
                    href={ad.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink size={10} />
                    {ad.link_url.length > 50 ? ad.link_url.slice(0, 50) + '…' : ad.link_url}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle */}
                <button
                  onClick={() => toggleAd(ad.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    ad.enabled
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {ad.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  {ad.enabled ? 'Active' : 'Hidden'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => removeAd(ad.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
