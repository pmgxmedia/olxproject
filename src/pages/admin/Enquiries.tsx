import { useState } from 'react'
import { Search, Mail, MailOpen, Reply, Archive, Trash2, MessageSquare } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import type { Enquiry } from '@/types'

const statusFilters = ['all', 'new', 'read', 'replied', 'archived'] as const

export default function AdminEnquiries() {
  const enquiries = useAdminStore((s) => s.enquiries)
  const updateEnquiryStatus = useAdminStore((s) => s.updateEnquiryStatus)
  const deleteEnquiry = useAdminStore((s) => s.deleteEnquiry)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  const filtered = enquiries.filter((e) => {
    const matchSearch =
      e.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      e.listing_title.toLowerCase().includes(search.toLowerCase()) ||
      e.message.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const newCount = enquiries.filter((e) => e.status === 'new').length

  function handleSelect(enquiry: Enquiry) {
    setSelectedEnquiry(enquiry)
    if (enquiry.status === 'new') {
      updateEnquiryStatus(enquiry.id, 'read')
    }
  }

  function handleReply(id: number) {
    updateEnquiryStatus(id, 'replied')
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry((prev) => prev ? { ...prev, status: 'replied' } : null)
    }
  }

  function handleArchive(id: number) {
    updateEnquiryStatus(id, 'archived')
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry(null)
    }
  }

  function handleDelete(id: number) {
    deleteEnquiry(id)
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#002f34]">Enquiries & Messages</h2>
          {newCount > 0 && (
            <p className="text-sm text-blue-600 mt-0.5">{newCount} new enquir{newCount !== 1 ? 'ies' : 'y'}</p>
          )}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} enquiries</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search enquiries..."
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
              {s === 'new' && newCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 text-[10px]">{newCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Enquiry list */}
        <div className={`bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 ${selectedEnquiry ? 'flex-1' : 'w-full'}`}>
          {sorted.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No enquiries found</p>
            </div>
          ) : (
            sorted.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => handleSelect(enquiry)}
                className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedEnquiry?.id === enquiry.id ? 'bg-blue-50' : ''
                } ${enquiry.status === 'new' ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {enquiry.status === 'new' ? (
                      <Mail size={14} className="text-blue-500" />
                    ) : (
                      <MailOpen size={14} className="text-gray-400" />
                    )}
                    <span className={`text-sm ${enquiry.status === 'new' ? 'font-semibold text-[#002f34]' : 'font-medium text-gray-700'}`}>
                      {enquiry.sender_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={enquiry.status} />
                    <span className="text-[11px] text-gray-400">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{enquiry.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">Re: {enquiry.listing_title}</p>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selectedEnquiry && (
          <div className="w-96 bg-white rounded-lg border border-gray-200 p-5 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#002f34]">Enquiry Details</h3>
              <button onClick={() => setSelectedEnquiry(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#23e5db] text-[#002f34] rounded-full flex items-center justify-center text-sm font-bold">
                {selectedEnquiry.sender_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#002f34]">{selectedEnquiry.sender_name}</p>
                <p className="text-xs text-gray-500">{selectedEnquiry.sender_email}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Regarding</p>
              <p className="text-sm font-medium text-[#002f34]">{selectedEnquiry.listing_title}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedEnquiry.message}</p>
            </div>

            <div className="text-xs text-gray-400">
              Sent {new Date(selectedEnquiry.created_at).toLocaleString()}
            </div>

            <div className="border-t border-gray-100 pt-3 flex gap-2">
              {selectedEnquiry.status !== 'replied' && (
                <button
                  onClick={() => handleReply(selectedEnquiry.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-[#23e5db] text-[#002f34] hover:bg-[#1dd1c8]"
                >
                  <Reply size={14} /> Mark Replied
                </button>
              )}
              <button
                onClick={() => handleArchive(selectedEnquiry.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <Archive size={14} />
              </button>
              <button
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
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
