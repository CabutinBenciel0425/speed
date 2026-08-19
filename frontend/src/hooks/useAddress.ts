import axios from "@/lib/axios"
import { useAddressStore } from "@/store/addressStore"
import type { Address } from "@/types/address"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

const fetchUserAddress = async (): Promise<Address[] | []> => {
  try {
    const { data } = await axios.get("/address")
    return data.data
  } catch (error) {
    console.log(error)
    return []
  }
}

export const useAddress = () => {
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
    queryKey: ["addresses"],
    queryFn: fetchUserAddress,
    retry: false,
  })

  useEffect(() => {
    if (isQueryLoading) return
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
    isQueryLoading,
    isError,
    data,
    setAddresses,
    setDefaultAddress,
    setLoading,
  ])

  useEffect(() => {
    if (!isQueryLoading) {
      setLoading(false)
    }
  }, [isQueryLoading, setLoading])

  const isLoading = storeIsLoading || isQueryLoading

  return {
    addresses,
    defaultAddress,
    isLoading,
  }
}
