import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import LoginPage from "./features/auth/pages/LoginPage"
import RegisterPage from "./features/auth/pages/RegisterPage"
import RoleSelectorPage from "./features/auth/pages/RoleSelectorPage"
import AuthLayout from "./components/layout/AuthLayout"
import CustomerLayout from "./components/layout/CustomerLayout"
import ScrollToTop from "./components/common/ScrollToTop"
import MerchantLayout from "./features/merchant/components/layout/MerchantLayout"
import MerchantSignupPage from "./features/auth/pages/MerchantSignupPage"
import DriverSignupPage from "./features/auth/pages/DriverSignupPage"
import AdminLayout from "./features/admin/components/AdminLayout"
import { getRoleHomePath } from "@/utils/roleRoutes"
import DriverLayout from "./features/driver/components/DriverLayout"
import PageLoading from "./components/common/PageLoading"
import RouteErrorBoundary from "./components/common/RouteErrorBoundary"

const Dashboard = lazy(() => import("./features/customer/pages/Dashboard"))
const CategoryProductsPage = lazy(
  () => import("./features/customer/pages/CategoryProductsPage")
)
const MerchantPage = lazy(
  () => import("./features/customer/pages/MerchantPage")
)
const EmailVerificationPage = lazy(
  () => import("./features/customer/pages/EmailVerificationPage")
)
const InputCodePage = lazy(
  () => import("./features/customer/pages/InputCodePage")
)
const ProductPage = lazy(() => import("./features/customer/pages/ProductPage"))
const SearchPage = lazy(() => import("./features/customer/pages/SearchPage"))
const SearchProductsAll = lazy(
  () => import("./features/customer/components/SearchProductsAll")
)
const SearchMerchantsAll = lazy(
  () => import("./features/customer/components/SearchMerchantsAll")
)
const CartPage = lazy(() => import("./features/customer/pages/CartPage"))
const FavoritesPage = lazy(
  () => import("./features/customer/pages/FavoritesPage")
)
const MerchantFavoritesAll = lazy(
  () => import("./features/customer/components/MerchantFavoritesAll")
)
const ProductFavoritesAll = lazy(
  () => import("./features/customer/components/ProductFavoritesAll")
)
const AddressPage = lazy(() => import("./features/customer/pages/AddressPage"))
const MerchantDashboard = lazy(
  () => import("./features/merchant/pages/MerchantDashboard")
)
const MerchantOrdersPage = lazy(
  () => import("./features/merchant/pages/MerchantOrdersPage")
)
const MerchantMenuPage = lazy(
  () => import("./features/merchant/pages/MerchantMenuPage")
)
const MerchantSettingsPage = lazy(
  () => import("./features/merchant/pages/MerchantSettingsPage")
)
const MerchantNotificationsPage = lazy(
  () => import("./features/merchant/pages/MerchantNotificationsPage")
)
const MerchantAnalyticsPage = lazy(
  () => import("./features/merchant/pages/MerchantAnalyticsPage")
)
const AdminDashboardPage = lazy(
  () => import("./features/admin/pages/AdminDashboardPage")
)
const AdminNotificationsPage = lazy(
  () => import("./features/admin/pages/AdminNotificationsPage")
)
const AdminAnalyticsPage = lazy(
  () => import("./features/admin/pages/AdminAnalyticsPage")
)
const AdminResourcePage = lazy(
  () => import("./features/admin/pages/AdminResourcePage")
)
const OrderReviewPage = lazy(
  () => import("./features/customer/pages/OrderReviewPage")
)
const OrderTrackingPage = lazy(
  () => import("./features/customer/pages/OrderTrackingPage")
)
const CustomerNotificationsPage = lazy(
  () => import("./features/customer/pages/CustomerNotificationPage")
)
const CustomerOrdersPage = lazy(
  () => import("./features/customer/pages/CustomerOrdersPage")
)
const OrderComponent = lazy(
  () => import("./features/merchant/components/common/OrderComponent")
)
const CustomerOrderComponent = lazy(
  () => import("./features/customer/components/CustomerOrderComponent")
)
const DriverDashboardPage = lazy(
  () => import("./features/driver/pages/DriverDashboardPage")
)
const DriverHistoryPage = lazy(
  () => import("./features/driver/pages/DriverHistoryPage")
)
const DriverOrderPage = lazy(
  () => import("./features/driver/pages/DriverOrderPage")
)
const DriverReviewsPage = lazy(
  () => import("./features/driver/pages/DriverReviewsPage")
)
const DriverProfilePage = lazy(
  () => import("./features/driver/pages/DriverProfilePage")
)
const CustomerReviewsPage = lazy(
  () => import("./features/reviews/pages/CustomerReviewsPage")
)
const MerchantReviewsPage = lazy(
  () => import("./features/reviews/pages/MerchantReviewsPage")
)

export function App() {
  const { isAuthenticated, isVerified, activeRole } = useAuth()

  return (
    <div className="min-h-screen w-full scrollbar-gutter-stable">
      {/* authentication */}
      <ScrollToTop />
      <RouteErrorBoundary>
        <Suspense
          fallback={<PageLoading label="Loading page…" className="min-h-screen" />}
        >
          <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path=":section" element={<AdminResourcePage />} />
          </Route>
          <Route path="/merchant" element={<MerchantLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MerchantDashboard />} />
            <Route path="menu" element={<MerchantMenuPage />} />
            <Route path="orders" element={<MerchantOrdersPage />} />
            <Route path="orders/:orderId" element={<OrderComponent />} />
            <Route path="reviews" element={<MerchantReviewsPage />} />
            <Route
              path="analytics"
              element={
                <Suspense
                  fallback={<PageLoading label="Loading analytics…" />}
                >
                  <MerchantAnalyticsPage />
                </Suspense>
              }
            />
            <Route
              path="notifications"
              element={<MerchantNotificationsPage />}
            />
            <Route path="settings" element={<MerchantSettingsPage />} />
          </Route>
          <Route path="/driver" element={<DriverLayout />}>
            <Route
              index
              element={
                <Suspense
                  fallback={<PageLoading label="Loading deliveries…" />}
                >
                  <DriverDashboardPage />
                </Suspense>
              }
            />
            <Route
              path="history"
              element={
                <Suspense
                  fallback={<PageLoading label="Loading history…" />}
                >
                  <DriverHistoryPage />
                </Suspense>
              }
            />
            <Route
              path="orders/:orderId"
              element={
                <Suspense fallback={<PageLoading label="Loading order details…" />}>
                  <DriverOrderPage />
                </Suspense>
              }
            />
            <Route
              path="reviews"
              element={
                <Suspense
                  fallback={<PageLoading label="Loading reviews…" />}
                >
                  <DriverReviewsPage />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense
                  fallback={<PageLoading label="Loading profile…" />}
                >
                  <DriverProfilePage />
                </Suspense>
              }
            />
          </Route>
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
              path="/orders/tracking/:orderId"
              element={
                isAuthenticated ? (
                  <OrderTrackingPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/orders/:orderId"
              element={
                isAuthenticated ? (
                  <CustomerOrderComponent />
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
              element={
                isAuthenticated ? <FavoritesPage /> : <Navigate to="/" />
              }
            />
            <Route
              path="/reviews"
              element={
                isAuthenticated ? (
                  <CustomerReviewsPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
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
        </Suspense>
      </RouteErrorBoundary>
    </div>
  )
}

export default App
