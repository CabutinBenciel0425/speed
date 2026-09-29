import axios from "@/lib/axios"
import type { Address, AddressLabel } from "@/types/address"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

const toggleDefaultAddress = async (
  label: AddressLabel
): Promise<Address[] | []> => {
  try {
    console.log(label)
    const { data } = await axios.patch(`/address/${label}`)
    return data.data
  } catch (error) {
    console.log(error)
    return []
  }
}

export const useToggleDefaultAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleDefaultAddress,
    onSuccess: () => {
      toast.success("Default address updated")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
    onError: (error: AxiosError) => {
      const message =
        (error.response?.data as any)?.message ||
        "Failed to update default address"
      toast.error(message)
    },
  })
}
