import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { useCreateListing, useUpdateListing, useListing } from '@/hooks/useListings'
import { useUploadVideo, useUploadImage } from '@/hooks/useUpload'
import ImageUploader from '@/components/media/ImageUploader'
import type { UploadedImage } from '@/components/media/ImageUploader'
import VideoUploader from '@/components/media/VideoUploader'
import CategoryCard from '@/components/listings/CategoryCard'
import { formatPrice } from '@/lib/utils'

const steps = ['Category', 'Details', 'Media', 'Review']

type ListingType = 'items' | 'services' | 'jobs'

export default function PostAd() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const isEditing = !!editId

  const [listingType, setListingType] = useState<ListingType>('items')
  const { data: categories } = useCategories(listingType)
  const [step, setStep] = useState(0)

  // Form state
  const [categoryId, setCategoryId] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used')
  const [price, setPrice] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationState, setLocationState] = useState('')
  const [locationSuburb, setLocationSuburb] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [video, setVideo] = useState<File | null>(null)

  const selectedCategory = categories?.find((c) => c.id === categoryId)
  const createListing = useCreateListing()
  const updateListing = useUpdateListing()
  const uploadVideo = useUploadVideo()
  const uploadImage = useUploadImage()

  // Fetch existing listing if editing
  const { data: existingListing, isLoading: loadingListing } = useListing(editId ? parseInt(editId) : 0)

  // Pre-populate form when editing
  useEffect(() => {
    if (existingListing && isEditing) {
      setCategoryId(existingListing.category_id)
      setTitle(existingListing.title)
      setDescription(existingListing.description)
      setCondition(existingListing.condition as 'new' | 'used' | 'refurbished')
      setPrice(String(existingListing.price))
      setLocationCity(existingListing.location_city || '')
      setLocationState(existingListing.location_state || '')
      setLocationSuburb(existingListing.location_suburb || '')

      // Convert images to UploadedImage format
      if (existingListing.images && existingListing.images.length > 0) {
        const existingImages: UploadedImage[] = existingListing.images.map((img: any, idx: number) => ({
          id: idx,
          file: new File([], img.image_url.split('/').pop()),
          preview: img.image_url,
          processedPreview: img.image_url
        }))
        setImages(existingImages)
      }
    }
  }, [existingListing, isEditing])

  function canNext() {
    switch (step) {
      case 0: return categoryId > 0
      case 1: return title.trim().length >= 3 && description.trim().length >= 10 && Number(price) > 0 && locationCity.trim().length > 0
      case 2: return images.length >= 1
      case 3: return true
      default: return false
    }
  }

  async function handleSubmit() {
    let videoUrl: string | null = null
    let videoThumbnailUrl: string | null = null

    const imageUrls: string[] = []
    for (const img of images) {
      // If image already has a preview URL (existing image), use it directly
      if (img.processedPreview && img.processedPreview.startsWith('/uploads/')) {
        imageUrls.push(img.processedPreview)
      } else if (img.preview && img.preview.startsWith('/uploads/')) {
        imageUrls.push(img.preview)
      } else {
        // Need to upload new image
        try {
          const fileToUpload = img.processedBlob ? new File([img.processedBlob], img.file.name, { type: img.file.type }) : img.file
          const result = await uploadImage.mutateAsync(fileToUpload)
          imageUrls.push(result.url)
        } catch {
          alert('Failed to upload images. Please try again.')
          return
        }
      }
    }

    if (video) {
      try {
        const videoResult = await uploadVideo.mutateAsync(video)
        videoUrl = videoResult.url
        videoThumbnailUrl = videoResult.thumbnail
      } catch {
        alert('Failed to upload video. Please try again.')
        return
      }
    }

    const payload = {
      category_id: categoryId,
      title: title,
      description: description,
      condition: condition,
      price: Number(price),
      location_city: locationCity,
      location_state: locationState,
      location_suburb: locationSuburb || null,
      image_urls: imageUrls,
      video_url: videoUrl,
      video_thumbnail_url: videoThumbnailUrl
    }

    if (isEditing && editId) {
      updateListing.mutate({ id: parseInt(editId), data: payload }, {
        onSuccess: () => {
          alert('Listing updated successfully!')
          navigate('/my-account')
        },
        onError: () => {
          alert('Failed to update listing. Please try again.')
        }
      })
    } else {
      createListing.mutate(payload as any, {
        onSuccess: () => {
          alert('Listing submitted successfully!')
          navigate('/my-account')
        },
        onError: () => {
          alert('Failed to submit listing. Please try again.')
        }
      })
    }
  }

  if (loadingListing) {
    return <div className="max-w-3xl mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#002f34] mb-6">
        {isEditing ? 'Edit Your Ad' : 'Post Your Ad'}
      </h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                i < step
                  ? 'bg-[#23e5db] text-[#002f34]'
                  : i === step
                    ? 'bg-[#002f34] text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? 'font-semibold text-[#002f34]' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Step 0: Category */}
        {step === 0 && (
          <div>
            <h2 className="font-semibold text-[#002f34] mb-4">What are you posting?</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(['items', 'services', 'jobs'] as ListingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setListingType(type)
                    setCategoryId(0)
                  }}
                  className={`py-3 px-4 rounded-lg border-2 font-medium capitalize transition-colors ${
                    listingType === type
                      ? 'border-[#002f34] bg-[#002f34] text-white'
                      : 'border-gray-300 hover:border-[#002f34] text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <h2 className="font-semibold text-[#002f34] mb-4">Choose a Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {categories?.map((c) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  onSelect={() => setCategoryId(c.id)}
                  selected={categoryId === c.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-[#002f34] mb-4">Ad Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder="e.g., iPhone 15 Pro Max 256GB"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/150</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe your item — include details buyers will want to know"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
              <div className="flex gap-3">
                {(['new', 'used', 'refurbished'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                      condition === c
                        ? 'border-[#002f34] bg-[#002f34] text-white'
                        : 'border-gray-300 hover:border-[#002f34]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (ZAR) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suburb / Area</label>
                <input
                  type="text"
                  value={locationSuburb}
                  onChange={(e) => setLocationSuburb(e.target.value)}
                  placeholder="e.g., Rosebank"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="e.g., Johannesburg"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <input
                  type="text"
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  placeholder="e.g., Gauteng"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-[#002f34] mb-1">Add Photos *</h2>
              <p className="text-sm text-gray-500 mb-3">
                Tip: Use "Remove Background" for cleaner product photos
              </p>
              <ImageUploader images={images} onChange={setImages} />
            </div>

            <div>
              <h2 className="font-semibold text-[#002f34] mb-1">Add Video</h2>
              <p className="text-sm text-gray-500 mb-3">
                A short video can help buyers see your product in action
              </p>
              <VideoUploader video={video} onChange={setVideo} />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-[#002f34] mb-4">Review Your Ad</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category</span>
                <p className="font-medium">{selectedCategory?.name ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Condition</span>
                <p className="font-medium capitalize">{condition}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Title</span>
                <p className="font-medium">{title}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Description</span>
                <p className="font-medium text-gray-700">{description}</p>
              </div>
              <div>
                <span className="text-gray-500">Price</span>
                <p className="font-bold text-lg">{formatPrice(Number(price))}</p>
              </div>
              <div>
                <span className="text-gray-500">Location</span>
                <p className="font-medium">
                  {locationSuburb ? `${locationSuburb}, ` : ''}{locationCity}{locationState ? `, ${locationState}` : ''}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Media</span>
                <p className="font-medium">{images.length} photo{images.length !== 1 ? 's' : ''}{video ? ' + 1 video' : ''}</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.processedPreview ?? img.preview}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium bg-[#002f34] text-white rounded-lg hover:bg-[#003e45] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1 px-6 py-2.5 text-sm font-bold bg-[#23e5db] text-[#002f34] rounded-lg hover:bg-[#1fd1c8]"
          >
            <Check size={16} /> {isEditing ? 'Update Ad' : 'Post Ad'}
          </button>
        )}
      </div>
    </div>
  )
}
