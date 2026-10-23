import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import type { User } from "@/types/user"

type UpdateProfileResponse = { data: { user: User } }

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) =>
      (await axios.patch<UpdateProfileResponse>("/auth/update-user", formData)).data.data.user,
    onSuccess: (user) => {
      const activeRole = useAuthStore.getState().activeRole ?? "Customer"
      useAuthStore.getState().setAuth(user, activeRole)
      queryClient.setQueryData(["currentUser"], { user, activeRole })
      toast.success("Profile updated successfully")
      if (!user.isVerified) {
        toast.info("Your email changed. Verify the new address to keep your account verified.")
      }
    },
    onError: (error) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? "Could not update your profile. Please try again.")
    },
  })
}
