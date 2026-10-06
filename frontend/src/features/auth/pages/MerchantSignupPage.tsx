import { Navigate, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import MerchantProfileForm from "@/features/merchant/components/MerchantProfileForm"
import { useCreateProviderProfile } from "../hooks/useCreateProviderProfile"

function MerchantSignupPage() {
  const { isAuthenticated, isVerified } = useAuth()
  const createMerchant = useCreateProviderProfile("merchant")

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
      <Button render={<NavLink to="/" />} variant="ghost" className="mb-4">
        ← Back to Speed
      </Button>
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        Register your store
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Add your store details, map location, and opening hours.
      </p>
      {!isVerified ? (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          Verify your email before registering as a merchant.{" "}
          <NavLink className="text-primary underline" to="/verify-email">
            Verify email
          </NavLink>
        </p>
      ) : (
        <MerchantProfileForm
          requireLogo
          submitLabel="Create merchant account"
          isSaving={createMerchant.isPending}
          onSave={(payload) => createMerchant.mutate(payload)}
        />
      )}
    </main>
  )
}

export default MerchantSignupPage
