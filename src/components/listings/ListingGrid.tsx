import ListingCard from './ListingCard'
import type { Listing } from '@/types'

export default function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
