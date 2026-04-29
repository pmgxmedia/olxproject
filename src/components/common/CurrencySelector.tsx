import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCurrencyStore, AFRICAN_CURRENCIES } from '@/stores/currencyStore'

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-2 text-sm hover:border-[#002f34] transition-colors"
      >
        <span>{currency.flag}</span>
        <span className="font-medium">{currency.code}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-64 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Select Currency</p>
          </div>
          {AFRICAN_CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                currency.code === c.code ? 'bg-[#f0fffe] text-[#002f34] font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{c.flag}</span>
              <div className="flex-1 text-left">
                <span className="block">{c.name}</span>
                <span className="text-xs text-gray-400">{c.symbol} — {c.code}</span>
              </div>
              {currency.code === c.code && (
                <span className="text-[#23e5db] text-lg">✓</span>
              )}
            </button>
          ))}
          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-tight">
              Rates are approximate and updated periodically. Base currency: ZAR.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
