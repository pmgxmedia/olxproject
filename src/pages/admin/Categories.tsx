import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'
import { mockCategories } from '@/data/mock'
import type { Category } from '@/types'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  function saveEdit(id: number) {
    if (!editName.trim()) return
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, name: editName.trim(), slug: editName.trim().toLowerCase().replace(/\s+/g, '-') }
          : {
              ...c,
              children: c.children?.map((ch) =>
                ch.id === id
                  ? { ...ch, name: editName.trim(), slug: editName.trim().toLowerCase().replace(/\s+/g, '-') }
                  : ch,
              ),
            },
      ),
    )
    setEditingId(null)
  }

  function deleteCategory(id: number) {
    setCategories((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, children: c.children?.filter((ch) => ch.id !== id) })),
    )
  }

  function addCategory() {
    if (!newCatName.trim()) return
    const newId = Math.max(...categories.flatMap((c) => [c.id, ...(c.children?.map((ch) => ch.id) ?? [])]),) + 1
    setCategories((prev) => [
      ...prev,
      {
        id: newId,
        name: newCatName.trim(),
        slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
        icon: 'folder',
        parent_id: null,
      },
    ])
    setNewCatName('')
    setShowAdd(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002f34]">Categories ({categories.length})</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#002f34] text-white text-sm font-medium rounded-lg hover:bg-[#003a40] transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-[#23e5db] text-[#002f34] text-sm font-medium rounded-lg hover:bg-[#1dd1c8] transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewCatName('') }}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                {cat.children && cat.children.length > 0 && (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
                {editingId === cat.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveEdit(cat.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                    autoFocus
                  />
                ) : (
                  <span className="font-medium text-[#002f34]">{cat.name}</span>
                )}
                <span className="text-xs text-gray-400">/{cat.slug}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(cat)} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                  <Edit2 size={14} className="text-gray-500" />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded hover:bg-red-50" title="Delete">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            {/* Subcategories */}
            {cat.children?.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between px-4 py-2.5 pl-10 hover:bg-gray-50 bg-gray-50/50"
              >
                <div className="flex items-center gap-2">
                  {editingId === child.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEdit(child.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(child.id)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#23e5db]"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{child.name}</span>
                  )}
                  <span className="text-xs text-gray-400">/{child.slug}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(child)} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                    <Edit2 size={14} className="text-gray-500" />
                  </button>
                  <button onClick={() => deleteCategory(child.id)} className="p-1.5 rounded hover:bg-red-50" title="Delete">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
