import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSideBar from "../common/AppSideBar"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { getRoleHomePath } from "@/utils/roleRoutes"
import Footer from "@/components/common/Footer"
import { useMerchantRealtime } from "../../hooks/useMerchantRealtime"

function MerchantLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  useMerchantRealtime()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (activeRole !== "Merchant")
    return <Navigate to={getRoleHomePath(activeRole)} replace />

  return (
    <div className="flex min-h-screen min-w-full flex-col">
      <SidebarProvider>
        <AppSideBar />
        <main className="w-full">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
      <Footer />
    </div>
  )
}

export default MerchantLayout
