import { Route, Routes } from "react-router-dom"
import LoginPage from "./features/auth/pages/LoginPage"
import RegisterPage from "./features/auth/pages/RegisterPage"
import RoleSelectorPage from "./features/auth/pages/RoleSelectorPage"
import AuthLayout from "./components/layout/AuthLayout"
import CustomerLayout from "./components/layout/CustomerLayout"
import CustomerDashboard from "./features/customer/pages/CustomerDashboard"

export function App() {
  return (
    <div className="flex scrollbar-gutter-stable items-center justify-center">
      {/* authentication */}
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/select-role" element={<RoleSelectorPage />} />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          {/* <Route path="/products" element={<LoginPage />} />
          <Route path="/orders" element={<RegisterPage />} />
          <Route path="/favorites" element={<RoleSelectorPage />} /> */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
