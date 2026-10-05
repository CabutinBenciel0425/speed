import { Navigate, Outlet } from "react-router-dom"
import Navbar from "../common/Navbar"
import Footer from "../common/Footer"
import { useAuth } from "@/hooks/useAuth"
import { getRoleHomePath } from "@/utils/roleRoutes"

function CustomerLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null
  if (isAuthenticated && activeRole !== "Customer") {
    return <Navigate to={getRoleHomePath(activeRole)} replace />
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
