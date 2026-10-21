import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSideBar from "../common/AppSideBar"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { getRoleHomePath } from "@/utils/roleRoutes"
import Footer from "@/components/common/Footer"
import { useMerchantRealtime } from "../../hooks/useMerchantRealtime"
import PageLoading from "@/components/common/PageLoading"

function MerchantLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  useMerchantRealtime()
  if (isLoading) return <PageLoading label="Checking your session…" className="min-h-screen" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (activeRole !== "Merchant")
    return <Navigate to={getRoleHomePath(activeRole)} replace />

  return (
    <div className="flex min-h-screen min-w-full flex-col">
      <SidebarProvider>
        <AppSideBar />
        <main className="min-w-0 w-full flex-1">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
      <Footer />
    </div>
  )
}

export default MerchantLayout
