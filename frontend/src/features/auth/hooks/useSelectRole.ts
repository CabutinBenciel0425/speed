import { useMutation } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"

const selectRole = async (role: string) => {
  const res = await axios.post("auth/select-role", { activeRole: role })
  return res.data
}

export const useSelectRole = () => {
  return useMutation({
    mutationFn: selectRole,
    onSuccess: () => {
      toast.success("Role selected successfully")
    },
    onError: () => {
      toast.error("Failed to select role")
    },
  })
}
