import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import AdminSidebar from "./AdminSidebar"
import { getRoleHomePath } from "@/utils/roleRoutes"

export default function AdminLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (activeRole !== "Admin")
    return <Navigate to={getRoleHomePath(activeRole)} replace />

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
