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
import ProductPage from "./features/customer/pages/ProductPage"
import SearchPage from "./features/customer/pages/SearchPage"
import SearchProductsAll from "./features/customer/components/SearchProductsAll"
import SearchMerchantsAll from "./features/customer/components/SearchMerchantsAll"
import CartPage from "./features/customer/pages/CartPage"
import FavoritesPage from "./features/customer/pages/FavoritesPage"
import MerchantFavoritesAll from "./features/customer/components/MerchantFavoritesAll"
import ProductFavoritesAll from "./features/customer/components/ProductFavoritesAll"
import AddressPage from "./features/customer/pages/AddressPage"
import MerchantDashboard from "./features/merchant/pages/MerchantDashboard"
import { Outlet } from "react-router-dom"

function MerchantOnlyRoute() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (activeRole !== "Merchant") return <Navigate to="/" replace />
  return <Outlet />
}

export function App() {
  const { isAuthenticated, isVerified } = useAuth()

  return (
    <div className="flex min-h-screen w-full scrollbar-gutter-stable items-center justify-center">
      {/* authentication */}
      <ScrollToTop />
      <Routes>
        <Route element={<MerchantOnlyRoute />}>
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        </Route>
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
          <Route
            path="/input-otp"
            element={!isVerified ? <InputCodePage /> : <Navigate to="/" />}
          />
          <Route
            path="/category/:categoryId"
            element={<CategoryProductsPage />}
          />
          <Route path="/merchant/:merchantId" element={<MerchantPage />} />
          <Route
            path="/merchant/:merchantId/:productId"
            element={<ProductPage />}
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/search/products" element={<SearchProductsAll />} />
          <Route path="/search/merchants" element={<SearchMerchantsAll />} />
          <Route
            path="/cart"
            element={isAuthenticated ? <CartPage /> : <Navigate to="/" />}
          />
          <Route
            path="/favorites"
            element={isAuthenticated ? <FavoritesPage /> : <Navigate to="/" />}
          />
          <Route
            path="/favorites/merchants"
            element={
              isAuthenticated ? <MerchantFavoritesAll /> : <Navigate to="/" />
            }
          />
          <Route
            path="/favorites/products"
            element={
              isAuthenticated ? <ProductFavoritesAll /> : <Navigate to="/" />
            }
          />

          <Route
            path="/address"
            element={isAuthenticated ? <AddressPage /> : <Navigate to="/" />}
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
