import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AfricanCurrency {
  code: string
  name: string
  symbol: string
  flag: string
  locale: string
  /** Rate against 1 ZAR (base). ZAR itself is always 1. */
  rateFromZAR: number
}

export const AFRICAN_CURRENCIES: AfricanCurrency[] = [
  { code: 'ZAR', name: 'South African Rand',  symbol: 'R',   flag: '🇿🇦', locale: 'en-ZA', rateFromZAR: 1 },
  { code: 'NGN', name: 'Nigerian Naira',      symbol: '₦',   flag: '🇳🇬', locale: 'en-NG', rateFromZAR: 49.72 },
  { code: 'KES', name: 'Kenyan Shilling',     symbol: 'KSh', flag: '🇰🇪', locale: 'en-KE', rateFromZAR: 7.08 },
  { code: 'GHS', name: 'Ghanaian Cedi',       symbol: 'GH₵', flag: '🇬🇭', locale: 'en-GH', rateFromZAR: 0.82 },
  { code: 'EGP', name: 'Egyptian Pound',       symbol: 'E£',  flag: '🇪🇬', locale: 'ar-EG', rateFromZAR: 2.76 },
  { code: 'MAD', name: 'Moroccan Dirham',     symbol: 'MAD', flag: '🇲🇦', locale: 'ar-MA', rateFromZAR: 0.54 },
  { code: 'TZS', name: 'Tanzanian Shilling',  symbol: 'TSh', flag: '🇹🇿', locale: 'sw-TZ', rateFromZAR: 145.50 },
  { code: 'UGX', name: 'Ugandan Shilling',    symbol: 'USh', flag: '🇺🇬', locale: 'en-UG', rateFromZAR: 204.00 },
  { code: 'ETB', name: 'Ethiopian Birr',      symbol: 'Br',  flag: '🇪🇹', locale: 'am-ET', rateFromZAR: 6.95 },
  { code: 'XOF', name: 'West African CFA',    symbol: 'CFA', flag: '🌍', locale: 'fr-SN', rateFromZAR: 33.21 },
  { code: 'XAF', name: 'Central African CFA', symbol: 'FCFA',flag: '🌍', locale: 'fr-CM', rateFromZAR: 33.21 },
  { code: 'BWP', name: 'Botswana Pula',       symbol: 'P',   flag: '🇧🇼', locale: 'en-BW', rateFromZAR: 0.74 },
  { code: 'MZN', name: 'Mozambican Metical',  symbol: 'MT',  flag: '🇲🇿', locale: 'pt-MZ', rateFromZAR: 3.53 },
  { code: 'ZMW', name: 'Zambian Kwacha',      symbol: 'ZK',  flag: '🇿🇲', locale: 'en-ZM', rateFromZAR: 1.52 },
]

interface CurrencyState {
  currency: AfricanCurrency
  setCurrency: (code: string) => void
  convert: (priceInZAR: number) => number
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: AFRICAN_CURRENCIES[0], // ZAR default

      setCurrency: (code: string) => {
        const found = AFRICAN_CURRENCIES.find((c) => c.code === code)
        if (found) set({ currency: found })
      },

      convert: (priceInZAR: number) => {
        const { currency } = get()
        if (currency.code === 'ZAR') return priceInZAR
        return Math.round(priceInZAR * currency.rateFromZAR * 100) / 100
      },
    }),
    {
      name: 'tradeflex-currency',
      partialize: (state) => ({ currency: state.currency }),
    },
  ),
)
