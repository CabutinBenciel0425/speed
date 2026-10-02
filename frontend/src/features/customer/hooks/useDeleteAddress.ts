import axios from "@/lib/axios"
import type { AddressLabel } from "@/types/address"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

type DeleteAddressResponse = {
  success: boolean
  message: string
}

const deleteAddress = async (
  label: AddressLabel
): Promise<DeleteAddressResponse> => {
  const { data } = await axios.delete(`/address/${label}`)
  return data
}

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
    onError: (error: AxiosError) => {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "Failed to deletes address"
      toast.error(message)
    },
  })
}
