import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { Play, Eye, EyeOff } from 'lucide-react'
import type { ListingImage } from '@/types'
// @ts-expect-error — Swiper CSS imports lack type declarations
import 'swiper/css'
// @ts-expect-error — Swiper CSS imports lack type declarations
import 'swiper/css/navigation'
// @ts-expect-error — Swiper CSS imports lack type declarations
import 'swiper/css/pagination'

interface Props {
  images: ListingImage[]
  videoUrl?: string | null
  videoThumbnailUrl?: string | null
  title: string
}

export default function MediaCarousel({ images, videoUrl, videoThumbnailUrl, title }: Props) {
  const [showProcessed, setShowProcessed] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(false)
  const hasProcessedImages = images.some((img) => img.processed_image_url)

  const totalSlides = images.length + (videoUrl ? 1 : 0)

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        className="w-full aspect-[4/3] md:aspect-[16/10]"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.id}>
            <img
              src={
                showProcessed && img.processed_image_url
                  ? img.processed_image_url
                  : img.image_url
              }
              alt={`${title} - image ${i + 1}`}
              className="w-full h-full object-contain"
            />
          </SwiperSlide>
        ))}

        {videoUrl && (
          <SwiperSlide>
            {playingVideo ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={() => setPlayingVideo(true)}
              >
                {videoThumbnailUrl ? (
                  <img
                    src={videoThumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Play size={48} className="text-white" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play size={28} className="text-[#002f34] ml-1" />
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        )}
      </Swiper>

      {/* Slide counter */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
        {totalSlides} photos{videoUrl ? ' + video' : ''}
      </div>

      {/* BG toggle */}
      {hasProcessedImages && (
        <button
          onClick={() => setShowProcessed(!showProcessed)}
          className="absolute top-3 right-3 bg-white/90 text-[#002f34] text-xs px-3 py-1.5 rounded-full z-10 flex items-center gap-1 font-medium hover:bg-white shadow"
        >
          {showProcessed ? <EyeOff size={14} /> : <Eye size={14} />}
          {showProcessed ? 'Show Original' : 'Remove BG'}
        </button>
      )}
    </div>
  )
}
