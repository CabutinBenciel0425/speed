import { Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./features/auth/pages/LoginPage"
import RegisterPage from "./features/auth/pages/RegisterPage"
import RoleSelectorPage from "./features/auth/pages/RoleSelectorPage"
import AuthLayout from "./components/layout/AuthLayout"
import CustomerLayout from "./components/layout/CustomerLayout"
import Dashboard from "./features/customer/pages/Dashboard"
import { useAuth } from "./hooks/useAuth"
import CategoryProductsPage from "./features/customer/pages/CategoryProductsPage"
import ScrollToTop from "./components/common/ScrollToTop"
import MerchantPage from "./features/customer/pages/MerchantPage"
import EmailVerificationPage from "./features/customer/pages/EmailVerificationPage"
import InputCodePage from "./features/customer/pages/InputCodePage"

export function App() {
  const { isAuthenticated, isVerified } = useAuth()

  return (
    <div className="flex min-h-screen w-full scrollbar-gutter-stable items-center justify-center">
      {/* authentication */}
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
          />
          <Route
            path="/select-role"
            element={
              !isAuthenticated ? <RoleSelectorPage /> : <Navigate to="/" />
            }
          />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/verify-email"
            element={
              !isVerified ? <EmailVerificationPage /> : <Navigate to="/" />
            }
          />
          <Route path="/input-otp" element={<InputCodePage />} />
          <Route
            path="/category/:categoryId"
            element={<CategoryProductsPage />}
          />
          <Route path="/category/:merchantId" element={<MerchantPage />} />
          {/* <Route path="/products" element={<LoginPage />} />
          <Route path="/orders" element={<RegisterPage />} />
          <Route path="/favorites" element={<RoleSelectorPage />} /> */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
