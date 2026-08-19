import type { Address } from "@/types/address"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AddressStore {
  addresses: Address[]
  defaultAddress: Address | null
  isLoading: boolean
  setAddresses: (addresses: Address[]) => void
  setDefaultAddress: (address: Address | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addresses: [],
      defaultAddress: null,
      isLoading: true,
      setAddresses: (addresses) => set({ addresses }),
      setDefaultAddress: (address) => set({ defaultAddress: address }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "address-storage",
      partialize: (state) => ({
        defaultAddress: state.defaultAddress,
      }),
    }
  )
)
