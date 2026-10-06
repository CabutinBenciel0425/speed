import MerchantProfileForm from "../components/MerchantProfileForm"
import { useMyMerchantProfile } from "../hooks/useMerchantProfile"
import { useUpdateMerchantProfile } from "../hooks/useUpdateMerchantProfile"

function MerchantSettingsPage() {
  const { merchant, isLoading, error } = useMyMerchantProfile()
  const updateProfile = useUpdateMerchantProfile(merchant?._id)

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Loading store settings…
      </p>
    )
  }
  if (error || !merchant) {
    return (
      <p className="p-6 text-sm text-destructive">
        Could not load your store settings.
      </p>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-2 px-4 py-6 sm:px-8 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Store settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your store details, delivery location, and weekly hours.
        </p>
      </header>
      <MerchantProfileForm
        merchant={merchant}
        isSaving={updateProfile.isPending}
        onSave={(payload) => updateProfile.mutate(payload)}
      />
    </main>
  )
}

export default MerchantSettingsPage
