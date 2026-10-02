import { Navigate, Outlet } from "react-router-dom"
import Navbar from "../common/Navbar"
import Footer from "../common/Footer"
import { useAuth } from "@/hooks/useAuth"

function CustomerLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null
  if (isAuthenticated && activeRole !== "Customer") {
    if (activeRole === "Merchant") {
      return <Navigate to="/merchant/dashboard" replace />
    }
    return (
      <div className="p-8">Customer pages are not available for this role.</div>
    )
  }

  return (
    <div className="flex min-h-screen min-w-full flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default CustomerLayout
