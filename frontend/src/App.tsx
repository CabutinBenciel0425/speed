import { Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./features/auth/pages/LoginPage"
import RegisterPage from "./features/auth/pages/RegisterPage"
import RoleSelectorPage from "./features/auth/pages/RoleSelectorPage"
import AuthLayout from "./components/layout/AuthLayout"
import CustomerLayout from "./components/layout/CustomerLayout"
import Dashboard from "./features/customer/pages/Dashboard"
import { useAuth } from "./hooks/useAuth"
import CategoryProductsPage from "./features/customer/pages/CategoryProductsPage"

export function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex scrollbar-gutter-stable items-center justify-center">
      {/* authentication */}
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
            path="/category/:categoryId"
            element={<CategoryProductsPage />}
          />
          {/* <Route path="/products" element={<LoginPage />} />
          <Route path="/orders" element={<RegisterPage />} />
          <Route path="/favorites" element={<RoleSelectorPage />} /> */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
