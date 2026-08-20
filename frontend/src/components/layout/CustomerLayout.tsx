import { Outlet } from "react-router-dom"
import Navbar from "../common/Navbar"
import Footer from "../common/Footer"

function CustomerLayout() {
  return (
    <div className="flex min-h-screen min-w-full flex-col gap-10">
      <Navbar />
      <div className="flex-1 px-10">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default CustomerLayout
