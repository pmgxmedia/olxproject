import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Video, X, AlertCircle } from 'lucide-react'

interface Props {
  video: File | null
  onChange: (file: File | null) => void
  maxDuration?: number
  maxSizeMB?: number
}

export default function VideoUploader({ video, onChange, maxDuration = 30, maxSizeMB = 50 }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const validateDuration = useCallback(
    (file: File): Promise<number> =>
      new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src)
          if (video.duration > maxDuration) {
            reject(new Error(`Video must be ${maxDuration} seconds or less (yours is ${Math.round(video.duration)}s)`))
          } else {
            resolve(video.duration)
          }
        }
        video.onerror = () => reject(new Error('Could not read video file'))
        video.src = URL.createObjectURL(file)
      }),
    [maxDuration],
  )

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setError(null)
      const file = accepted[0]
      if (!file) return

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Video must be under ${maxSizeMB}MB`)
        return
      }

      try {
        const dur = await validateDuration(file)
        setDuration(dur)
        setPreview(URL.createObjectURL(file))
        onChange(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid video')
      }
    },
    [maxSizeMB, validateDuration, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm'] },
    maxFiles: 1,
    disabled: !!video,
  })

  function remove() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setDuration(0)
    setError(null)
    onChange(null)
  }

  if (video && preview) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={preview}
            controls
            className="w-full max-h-64 object-contain"
          />
          <button
            type="button"
            onClick={remove}
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
          >
            <X size={16} className="text-red-600" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{video.name}</span>
          <span>{(video.size / (1024 * 1024)).toFixed(1)}MB</span>
          <span>{Math.round(duration)}s</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#23e5db] bg-[#23e5db]/5' : 'border-gray-300 hover:border-[#002f34]'
        }`}
      >
        <input {...getInputProps()} />
        <Video size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Drop video here' : 'Add a product video (optional)'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          MP4 or WebM · Max {maxDuration}s · Max {maxSizeMB}MB
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  )
}
