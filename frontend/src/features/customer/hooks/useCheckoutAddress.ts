import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Address } from "@/types/address"

async function fetchDefaultAddress(): Promise<Address | null> {
  const { data } = await axios.get<{ data: Address[] }>("/address")
  return data.data.find((address) => address.isDefault) ?? null
}

export function useCheckoutAddress() {
  return useQuery({
    queryKey: ["checkoutAddresses"],
    queryFn: fetchDefaultAddress,
    staleTime: 30_000,
  })
}
