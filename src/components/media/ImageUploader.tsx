import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Star, Wand2 } from 'lucide-react'
import BackgroundRemover from './BackgroundRemover'

export interface UploadedImage {
  id: string
  file: File
  preview: string
  processedPreview: string | null
  processedBlob: Blob | null
  isPrimary: boolean
}

interface Props {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 8 }: Props) {
  const [removingBgId, setRemovingBgId] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = maxImages - images.length
      const toAdd = accepted.slice(0, remaining).map((file, i) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        processedPreview: null,
        processedBlob: null,
        isPrimary: images.length === 0 && i === 0,
      }))
      onChange([...images, ...toAdd])
    },
    [images, maxImages, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    disabled: images.length >= maxImages,
  })

  function removeImage(id: string) {
    const updated = images.filter((img) => img.id !== id)
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true
    }
    onChange(updated)
  }

  function setPrimary(id: string) {
    onChange(images.map((img) => ({ ...img, isPrimary: img.id === id })))
  }

  function handleBgRemoved(id: string, processedBlob: Blob) {
    const processedPreview = URL.createObjectURL(processedBlob)
    onChange(
      images.map((img) =>
        img.id === id ? { ...img, processedBlob, processedPreview } : img,
      ),
    )
    setRemovingBgId(null)
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#23e5db] bg-[#23e5db]/5' : 'border-gray-300 hover:border-[#002f34]'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {images.length}/{maxImages} images · JPG, PNG, WebP · Max 5MB each
        </p>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={img.processedPreview ?? img.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setPrimary(img.id)}
                  title="Set as primary"
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center"
                >
                  <Star size={14} className={img.isPrimary ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
                </button>
                <button
                  type="button"
                  onClick={() => setRemovingBgId(img.id)}
                  title="Remove background"
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center"
                >
                  <Wand2 size={14} className="text-purple-600" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  title="Delete"
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1 left-1 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded text-[#002f34]">
                  PRIMARY
                </div>
              )}

              {/* BG removed badge */}
              {img.processedPreview && (
                <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  BG Removed
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Background remover modal */}
      {removingBgId && (
        <BackgroundRemover
          imageFile={images.find((i) => i.id === removingBgId)!.file}
          onComplete={(blob) => handleBgRemoved(removingBgId, blob)}
          onCancel={() => setRemovingBgId(null)}
        />
      )}
    </div>
  )
}
