import { Outlet } from "react-router-dom"
import Navbar from "../common/Navbar"
import Footer from "../common/Footer"

function CustomerLayout() {
  return (
    <div className="flex min-h-screen min-w-full flex-col">
      <Navbar />
      <div className="px-10">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default CustomerLayout
