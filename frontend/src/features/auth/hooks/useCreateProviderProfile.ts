import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import axios from "@/lib/axios"
import { toast } from "sonner"

export type ProviderRole = "merchant" | "driver"

export function useCreateProviderProfile(role: ProviderRole) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FormData) =>
      axios.post(`/auth/sign-up/${role}`, payload),
    onSuccess: () => {
      toast.success(
        `Your ${role} account is ready. Sign out and back in to switch to it.`
      )
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (error) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? `Could not create your ${role} account.`)
    },
  })
}
