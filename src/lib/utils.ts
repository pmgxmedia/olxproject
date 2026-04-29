import { useCurrencyStore, type AfricanCurrency } from '@/stores/currencyStore'

/**
 * Format a price in ZAR, converting to the user's selected currency.
 * Call without arguments for the global selected currency.
 */
export function formatPrice(priceInZAR: number, _listingCurrency?: string): string {
  const { currency, convert } = useCurrencyStore.getState()
  const converted = convert(priceInZAR)
  return formatWithCurrency(converted, currency)
}

export function formatWithCurrency(amount: number, cur: AfricanCurrency): string {
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    // Fallback if Intl doesn't recognise the currency code
    return `${cur.symbol} ${amount.toLocaleString()}`
  }
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
