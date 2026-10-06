import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Merchant } from "@/features/customer/types/merchant"
import type { ApiResponse } from "@/types/types"
import { toast } from "sonner"
import { apiErrorMessage } from "../utils/apiErrorMessage"

export function useUpdateMerchantProfile(merchantId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FormData) => {
      if (!merchantId) throw new Error("Merchant profile is unavailable")
      const { data } = await axios.patch<ApiResponse<Merchant>>(
        `/merchant/${merchantId}/profile`,
        payload
      )
      return data.data
    },
    onSuccess: (merchant) => {
      queryClient.setQueryData(["myMerchant"], merchant)
      void queryClient.invalidateQueries({ queryKey: ["merchant"] })
      void queryClient.invalidateQueries({ queryKey: ["merchants"] })
      toast.success("Store profile updated")
    },
    onError: (error) => {
      console.log(error)
      toast.error(
        apiErrorMessage(error, "Could not update your store profile.")
      )
    },
  })
}
