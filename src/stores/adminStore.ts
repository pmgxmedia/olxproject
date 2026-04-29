import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Enquiry, CommissionAd, VisitorStats } from '@/types'
import { mockEnquiries, mockCommissionAds, mockVisitorStats } from '@/data/mock'

interface AdminState {
  enquiries: Enquiry[]
  commissionAds: CommissionAd[]
  visitorStats: VisitorStats[]
  _seeded: boolean

  // Enquiry actions
  updateEnquiryStatus: (id: number, status: Enquiry['status']) => void
  deleteEnquiry: (id: number) => void

  // Commission ad actions
  addCommissionAd: (ad: Omit<CommissionAd, 'id' | 'clicks' | 'impressions' | 'revenue' | 'created_at'>) => void
  updateCommissionAd: (id: number, data: Partial<CommissionAd>) => void
  removeCommissionAd: (id: number) => void
  toggleCommissionAdStatus: (id: number) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      enquiries: [],
      commissionAds: [],
      visitorStats: [],
      _seeded: false,

      updateEnquiryStatus: (id, status) =>
        set((s) => ({
          enquiries: s.enquiries.map((e) => (e.id === id ? { ...e, status } : e)),
        })),

      deleteEnquiry: (id) =>
        set((s) => ({ enquiries: s.enquiries.filter((e) => e.id !== id) })),

      addCommissionAd: (ad) =>
        set((s) => ({
          commissionAds: [
            ...s.commissionAds,
            {
              ...ad,
              id: Date.now(),
              clicks: 0,
              impressions: 0,
              revenue: 0,
              created_at: new Date().toISOString(),
            },
          ],
        })),

      updateCommissionAd: (id, data) =>
        set((s) => ({
          commissionAds: s.commissionAds.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      removeCommissionAd: (id) =>
        set((s) => ({ commissionAds: s.commissionAds.filter((a) => a.id !== id) })),

      toggleCommissionAdStatus: (id) =>
        set((s) => ({
          commissionAds: s.commissionAds.map((a) =>
            a.id === id
              ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
              : a,
          ),
        })),
    }),
    {
      name: 'tradeflex-admin',
      onRehydrateStorage: () => {
        return (state: AdminState | undefined) => {
          if (state && !state._seeded) {
            useAdminStore.setState({
              enquiries: [...mockEnquiries],
              commissionAds: [...mockCommissionAds],
              visitorStats: [...mockVisitorStats],
              _seeded: true,
            })
          }
        }
      },
    },
  ),
)
