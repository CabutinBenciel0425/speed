import MerchantProfileForm from "../components/MerchantProfileForm"
import { useMyMerchantProfile } from "../hooks/useMerchantProfile"
import { useUpdateMerchantProfile } from "../hooks/useUpdateMerchantProfile"
import PageLoading from "@/components/common/PageLoading"
import PageError from "@/components/common/PageError"

function MerchantSettingsPage() {
  const { merchant, isLoading, error, refetch, isFetching } = useMyMerchantProfile()
  const updateProfile = useUpdateMerchantProfile(merchant?._id)

  if (isLoading) return <PageLoading label="Loading store settings…" />
  if (error || !merchant) {
    return (
      <main className="page-shell flex min-h-[50vh] items-center">
        <PageError
          message="Could not load your store settings. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </main>
    )
  }

  return (
    <main className="page-shell page-stack max-w-5xl">
      <header>
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
