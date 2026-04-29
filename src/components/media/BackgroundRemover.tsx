import { useState, useEffect, useRef } from 'react'
import { X, Check, Loader2 } from 'lucide-react'

interface Props {
  imageFile: File
  onComplete: (processedBlob: Blob) => void
  onCancel: () => void
}

export default function BackgroundRemover({ imageFile, onComplete, onCancel }: Props) {
  const [status, setStatus] = useState<'loading-model' | 'processing' | 'done' | 'error'>('loading-model')
  const [progress, setProgress] = useState(0)
  const [originalUrl] = useState(() => URL.createObjectURL(imageFile))
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const processedBlobRef = useRef<Blob | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setStatus('loading-model')
        setProgress(10)

        // Dynamic import so the 30MB WASM model only loads when needed
        const { removeBackground } = await import('@imgly/background-removal')
        if (cancelled) return

        setStatus('processing')
        setProgress(40)

        const blob = await removeBackground(imageFile, {
          progress: (key: string, current: number, total: number) => {
            if (key === 'compute:inference') {
              setProgress(40 + Math.round((current / total) * 55))
            }
          },
        })
        if (cancelled) return

        processedBlobRef.current = blob
        setProcessedUrl(URL.createObjectURL(blob))
        setProgress(100)
        setStatus('done')
      } catch (err) {
        if (!cancelled) {
          console.error('Background removal failed:', err)
          setStatus('error')
        }
      }
    }
    run()

    return () => {
      cancelled = true
    }
  }, [imageFile])

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-[#002f34]">Remove Background</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div className="relative aspect-square max-h-80 mx-auto rounded-lg overflow-hidden bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>')] bg-repeat">
            <img
              src={status === 'done' && !showOriginal && processedUrl ? processedUrl : originalUrl}
              alt=""
              className="w-full h-full object-contain"
            />

            {/* Processing overlay */}
            {(status === 'loading-model' || status === 'processing') && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3">
                <Loader2 size={40} className="animate-spin text-[#23e5db]" />
                <p className="text-sm font-medium text-[#002f34]">
                  {status === 'loading-model' ? 'Loading AI model...' : 'Removing background...'}
                </p>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#23e5db] transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {status === 'loading-model' && 'First time may take a moment'}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                <p className="text-sm font-medium text-red-600">Failed to remove background</p>
                <button
                  onClick={onCancel}
                  className="text-sm text-[#23e5db] hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Toggle */}
          {status === 'done' && (
            <div className="flex justify-center mt-3 gap-2">
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-3 py-1.5 text-sm rounded-full border ${
                  showOriginal ? 'bg-[#002f34] text-white' : 'border-gray-300'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-3 py-1.5 text-sm rounded-full border ${
                  !showOriginal ? 'bg-[#002f34] text-white' : 'border-gray-300'
                }`}
              >
                Background Removed
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 py-3 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => processedBlobRef.current && onComplete(processedBlobRef.current)}
            disabled={status !== 'done'}
            className="flex-1 py-2 text-sm font-medium bg-[#002f34] text-white rounded-lg hover:bg-[#003e45] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Check size={16} />
            Use This
          </button>
        </div>
      </div>
    </div>
  )
}
