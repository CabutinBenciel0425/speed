import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DeliveryOffer = {
  offerId: string
  merchantName: string
  merchantAddress: { street?: string; barangay?: string; city?: string }
  customerAddress?: { street?: string; barangay?: string; city?: string }
  deliveryFee: number
  estimatedDistance: number
  estimatedDuration: number
}

interface OfferStore {
  offers: DeliveryOffer[]
  setOffers: (offer: DeliveryOffer) => void
  removeOffer: (offerToRemove: DeliveryOffer) => void
}

export const useOfferStore = create<OfferStore>()(
  persist(
    (set, get) => ({
      offers: [],
      setOffers: (offer: DeliveryOffer) => {
        const { offers } = get()

        const newOffers = [offer, ...offers]

        set({ offers: newOffers })
      },
      removeOffer: (offerToRemove: DeliveryOffer) => {
        const { offers } = get()

        const newOffers = offers.filter(
          (offer) => offer.offerId !== offerToRemove.offerId
        )

        set({ offers: newOffers })
      },
    }),
    {
      name: "offers-storage",
      partialize: (state) => ({
        offers: state.offers,
      }),
    }
  )
)
