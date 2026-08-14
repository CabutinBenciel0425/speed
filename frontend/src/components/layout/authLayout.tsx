import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div className="relative flex min-h-screen min-w-full flex-row items-center justify-around">
      <Outlet />
    </div>
  )
}

export default AuthLayout
