import type { ValidRole } from "@/types/user"

export const getRoleHomePath = (
  role: ValidRole | string | null | undefined
) => {
  if (role === "Admin") return "/admin/dashboard"
  if (role === "Merchant") return "/merchant/dashboard"
  if (role === "Driver") return "/driver"
  return "/"
}
