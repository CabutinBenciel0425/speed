import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import LoginPage from "./features/auth/pages/LoginPage"
import RegisterPage from "./features/auth/pages/RegisterPage"
import RoleSelectorPage from "./features/auth/pages/RoleSelectorPage"
import AuthLayout from "./components/layout/AuthLayout"
import CustomerLayout from "./components/layout/CustomerLayout"
import Dashboard from "./features/customer/pages/Dashboard"
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
import MerchantLayout from "./features/merchant/components/layout/MerchantLayout"
import MerchantOrdersPage from "./features/merchant/pages/MerchantOrdersPage"
import MerchantMenuPage from "./features/merchant/pages/MerchantMenuPage"
import MerchantSettingsPage from "./features/merchant/pages/MerchantSettingsPage"
import MerchantNotificationsPage from "./features/merchant/pages/MerchantNotificationsPage"
import MerchantSignupPage from "./features/auth/pages/MerchantSignupPage"
import DriverSignupPage from "./features/auth/pages/DriverSignupPage"
import AdminLayout from "./features/admin/components/AdminLayout"
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage"
import AdminAnalyticsPage from "./features/admin/pages/AdminAnalyticsPage"
import AdminResourcePage from "./features/admin/pages/AdminResourcePage"
import { getRoleHomePath } from "@/utils/roleRoutes"
import OrderReviewPage from "./features/customer/pages/OrderReviewPage"
import OrderTrackingPage from "./features/customer/pages/OrderTrackingPage"
import DriverDashboardPage from "./features/driver/pages/DriverDashboardPage"
import CustomerNotificationsPage from "./features/customer/pages/CustomerNotificationPage"
import CustomerOrdersPage from "./features/customer/pages/CustomerOrdersPage"

const MerchantAnalyticsPage = lazy(
  () => import("./features/merchant/pages/MerchantAnalyticsPage")
)

export function App() {
  const { isAuthenticated, isVerified, activeRole } = useAuth()

  return (
    <div className="flex min-h-screen w-full scrollbar-gutter-stable items-center justify-center">
      {/* authentication */}
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path=":section" element={<AdminResourcePage />} />
        </Route>
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MerchantDashboard />} />
          <Route path="orders" element={<MerchantOrdersPage />} />
          <Route path="menu" element={<MerchantMenuPage />} />
          <Route
            path="analytics"
            element={
              <Suspense
                fallback={
                  <p className="p-6 text-sm text-muted-foreground">
                    Loading analytics…
                  </p>
                }
              >
                <MerchantAnalyticsPage />
              </Suspense>
            }
          />
          <Route path="notifications" element={<MerchantNotificationsPage />} />
          <Route path="settings" element={<MerchantSettingsPage />} />
        </Route>
        <Route path="/driver" element={<DriverDashboardPage />} />
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={getRoleHomePath(activeRole)} replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <RegisterPage />
              ) : (
                <Navigate to={getRoleHomePath(activeRole)} replace />
              )
            }
          />
          <Route
            path="/select-role"
            element={
              !isAuthenticated ? (
                <RoleSelectorPage />
              ) : (
                <Navigate to={getRoleHomePath(activeRole)} replace />
              )
            }
          />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route
            path="/checkout/review"
            element={
              isAuthenticated ? (
                <OrderReviewPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              isAuthenticated ? (
                <OrderTrackingPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/register/merchant" element={<MerchantSignupPage />} />
          <Route path="/register/driver" element={<DriverSignupPage />} />
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

          <Route
            path="/notifications"
            element={
              isAuthenticated ? (
                <CustomerNotificationsPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/orders"
            element={
              isAuthenticated ? <CustomerOrdersPage /> : <Navigate to="/" />
            }
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
