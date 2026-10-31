import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AddressInput } from "../types/address"
import type { Address } from "@/types/address"
import axios from "@/lib/axios"

const addNewAddress = async (addressValues: AddressInput): Promise<Address> => {
  const { data } = await axios.post("/address", addressValues)

  return data.data
}

export const useAddNewAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addNewAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      toast.success("Address added successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
