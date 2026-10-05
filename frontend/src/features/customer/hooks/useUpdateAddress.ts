import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AddressInput } from "../types/address"
import type { Address } from "@/types/address"
import axios from "@/lib/axios"

const updateAddress = async (addressValues: AddressInput): Promise<Address> => {
  const { data } = await axios.patch("/address", addressValues)

  return data.data
}

export const useUpdateAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      toast.success("Address updated successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
