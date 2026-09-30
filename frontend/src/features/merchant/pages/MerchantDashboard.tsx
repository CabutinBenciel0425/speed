import { useAuth } from "@/hooks/useAuth"

function MerchantDashboard() {
  const { activeRole } = useAuth()

  console.log(activeRole)
  return <div>THIS IS THE MERCHANT DASHBOARD</div>
}

export default MerchantDashboard
