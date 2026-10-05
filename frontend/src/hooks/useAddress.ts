import axios from "@/lib/axios"
import { useAddressStore } from "@/store/addressStore"
import type { Address } from "@/types/address"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

const fetchUserAddress = async (): Promise<Address[]> => {
  const { data } = await axios.get<{ data: Address[] }>("/address")
  return data.data
}

export const useAddress = () => {
  const { isAuthenticated, user } = useAuthStore()
  const {
    addresses,
    defaultAddress,
    isLoading: storeIsLoading,
    setAddresses,
    setDefaultAddress,
    setLoading,
  } = useAddressStore()

  const {
    data,
    isLoading: isQueryLoading,
    isError,
  } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: fetchUserAddress,
    enabled: isAuthenticated && Boolean(user?.id),
    retry: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([])
      setDefaultAddress(null)
      setLoading(false)
      return
    }
    if (isQueryLoading) {
      setAddresses([])
      setDefaultAddress(null)
      setLoading(true)
      return
    }
    if (!isError && data) {
      setAddresses(data)
      const defaultAddr =
        data.find((addr) => addr.isDefault === true) || data[0]
      setDefaultAddress(defaultAddr)
      setLoading(false)
    } else if (isError) {
      setLoading(false)
    } else {
      setAddresses([])
      setDefaultAddress(null)
      setLoading(false)
    }
  }, [
    isAuthenticated,
    isQueryLoading,
    isError,
    data,
    setAddresses,
    setDefaultAddress,
    setLoading,
  ])

  const isLoading = isAuthenticated && (storeIsLoading || isQueryLoading)

  return {
    addresses,
    defaultAddress,
    isLoading,
  }
}
