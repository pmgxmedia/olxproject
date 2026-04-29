import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PromotionalAd } from '@/types'

interface PromotionsState {
  ads: PromotionalAd[]
  addAd: (ad: Omit<PromotionalAd, 'id' | 'created_at' | 'sort_order'>) => void
  removeAd: (id: number) => void
  toggleAd: (id: number) => void
  updateAd: (id: number, data: Partial<Pick<PromotionalAd, 'title' | 'link_url' | 'image_url'>>) => void
  reorder: (ids: number[]) => void
  getEnabled: () => PromotionalAd[]
}

export const usePromotionsStore = create<PromotionsState>()(
  persist(
    (set, get) => ({
      ads: [],

      addAd: (ad) =>
        set((s) => ({
          ads: [
            ...s.ads,
            {
              ...ad,
              id: Date.now(),
              sort_order: s.ads.length,
              created_at: new Date().toISOString(),
            },
          ],
        })),

      removeAd: (id) => set((s) => ({ ads: s.ads.filter((a) => a.id !== id) })),

      toggleAd: (id) =>
        set((s) => ({
          ads: s.ads.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        })),

      updateAd: (id, data) =>
        set((s) => ({
          ads: s.ads.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      reorder: (ids) =>
        set((s) => ({
          ads: ids.map((id, i) => {
            const ad = s.ads.find((a) => a.id === id)!
            return { ...ad, sort_order: i }
          }),
        })),

      getEnabled: () =>
        get()
          .ads.filter((a) => a.enabled)
          .sort((a, b) => a.sort_order - b.sort_order),
    }),
    { name: 'tradeflex-promotions' },
  ),
)
