import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import AdminSidebar from "./AdminSidebar"
import { getRoleHomePath } from "@/utils/roleRoutes"
import PageLoading from "@/components/common/PageLoading"
import { useAdminRealtime } from "../hooks/useAdminRealtime"

export default function AdminLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  useAdminRealtime()
  if (isLoading)
    return (
      <PageLoading label="Checking your session…" className="min-h-screen" />
    )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (activeRole !== "Admin")
    return <Navigate to={getRoleHomePath(activeRole)} replace />

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
