import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Dot, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/features/customer/types/products"
import { useCategories } from "@/features/customer/hooks/useCategories"
import { useMyMerchantProfile } from "../hooks/useMerchantProfile"
import FilterMerchantProducts from "../components/common/FilterMerchantProducts"
import MerchantProductCard from "../components/common/MerchantProductCard"
import MerchantProductFormDialog, {
  type MerchantProductCategory,
} from "../components/common/MerchantProductFormDialog"
import { formatOperatingHours } from "@/utils/timeUtils"
import {
  useMerchantMenuProducts,
  useMerchantProductActions,
} from "../hooks/useMerchantMenuProducts"
import { useUpdateMerchantProduct } from "../hooks/useUpdateMerchantProduct"
import { useAddMerchantProduct } from "../hooks/useAddMerchantProduct"
import { useDeleteProduct } from "../hooks/useDeleteProduct"
import PageLoading from "@/components/common/PageLoading"
import PageError from "@/components/common/PageError"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import { Separator } from "@/components/ui/separator"

function MerchantMenuPage() {
  const {
    categories,
    error: categoriesError,
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useCategories()
  const {
    merchant,
    isLoading: isLoadingMerchant,
    error: merchantError,
    refetch: refetchMerchant,
    isFetching: isFetchingMerchant,
  } = useMyMerchantProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get("category") ?? ""
  const [dialogOpen, setDialogOpen] = useState(false)

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const allProductsQuery = useMerchantMenuProducts(merchant?._id, "")
  const addProductMutation = useAddMerchantProduct(merchant?._id)
  const updateProductMutation = useUpdateMerchantProduct(merchant?._id)
  const { mutate: deleteProduct } = useDeleteProduct()
  const {
    toggleFeature: toggleFeatureMutation,
    toggleAvailability: toggleAvailabilityMutation,
    deleteProduct: deleteProductMutation,
  } = useMerchantProductActions(merchant?._id)

  const categoryList: MerchantProductCategory[] = categories
    .filter((category) => category.isActive)
    .map((category) => ({
      id: category._id,
      name: category.name,
      slug: category.slug,
    }))

  const allProducts = useMemo(
    () => allProductsQuery.data ?? [],
    [allProductsQuery.data]
  )
  const products = useMemo(
    () =>
      categoryId
        ? allProducts.filter((product) => product.category === categoryId)
        : allProducts,
    [allProducts, categoryId]
  )
  const productCounts = useMemo(
    () =>
      allProducts.reduce<Record<string, number>>((counts, product) => {
        counts[product.category] = (counts[product.category] ?? 0) + 1
        return counts
      }, {}),
    [allProducts]
  )

  const selectCategory = (selectedId: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (selectedId) nextParams.set("category", selectedId)
    else nextParams.delete("category")
    setSearchParams(nextParams)
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const today = new Date()
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const
  const currentDay = days[today.getDay()]
  const todayHours = merchant?.operatingHours?.[currentDay]
  const operatingHoursToday = todayHours
    ? formatOperatingHours(todayHours)
    : "Closed"

  if (isLoadingMerchant) {
    return <PageLoading label="Loading your menu…" />
  }
  if (merchantError || !merchant) {
    return (
      <main className="page-shell flex min-h-[50vh] items-center">
        <PageError
          message="Could not load your merchant profile. Please try again."
          onRetry={() => void refetchMerchant()}
          isRetrying={isFetchingMerchant}
        />
      </main>
    )
  }

  const featuredProducts = products.filter((product) => product.isFeatured)
  const unfeaturedProducts = products
    .filter((product) => !product.isFeatured)
    .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))

  console.log(featuredProducts)
  console.log(unfeaturedProducts)
  return (
    <main className="page-shell page-stack max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="mb-5 flex items-center gap-4">
          <div className="size-16 overflow-hidden rounded-xl border bg-muted shadow-sm sm:size-20">
            <img
              src={merchant.logo || "/placeholder-logo.png"}
              alt={`${merchant.merchantName} logo`}
              className="h-20 w-20 object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              {merchant.merchantName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center">
                <Dot
                  className={`size-6 ${merchant.isOpen ? "text-emerald-500" : "text-slate-400"}`}
                />
                {merchant.isOpen ? "Open " : "Closed "}
              </span>
              <span>
                {operatingHoursToday} ({currentDay})
              </span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          onClick={openCreateDialog}
          className="flex items-center gap-2 px-5"
        >
          <Plus className="size-4" /> Add Item
        </Button>
      </div>

      <MerchantProductFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        categories={categoryList}
        isSaving={
          addProductMutation.isPending || updateProductMutation.isPending
        }
        onSave={(payload, productId) => {
          const options = {
            onSuccess: () => {
              setDialogOpen(false)
              setEditingProduct(null)
            },
          }
          if (productId) {
            updateProductMutation.mutate({ productId, payload }, options)
          } else {
            addProductMutation.mutate(payload, options)
          }
        }}
      />

      <section className="space-y-4">
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Menu</h2>
          <p className="text-sm text-slate-500">
            Manage your food and drink items, categories, and availability.
          </p>
        </div>
        <FilterMerchantProducts
          categories={categoryList}
          categoryId={categoryId}
          onSelect={selectCategory}
          allCount={allProducts.length}
          getCategoryCount={(id) => productCounts[id] ?? 0}
        />
        {categoriesError && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/20 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Could not load menu categories.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void refetchCategories()}
              disabled={isFetchingCategories}
            >
              Try again
            </Button>
          </div>
        )}

        {allProductsQuery.isLoading ? (
          <div
            className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            role="status"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        ) : allProductsQuery.isError ? (
          <PageError
            message="Could not load products. Please try again."
            onRetry={() => void allProductsQuery.refetch()}
            isRetrying={allProductsQuery.isFetching}
          />
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {categoryId
              ? "No products in this category."
              : "No products yet. Add your first menu item."}
          </p>
        ) : (
          <div className="flex flex-col items-start">
            <p className="inline-flex gap-2 py-4 text-lg font-semibold text-primary">
              <Sparkles /> Featured products
            </p>
            <div className="mb-5 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <MerchantProductCard
                  key={product._id}
                  merchantId={merchant?._id}
                  product={product}
                  onEdit={openEditDialog}
                  onToggleFeature={(item) =>
                    toggleFeatureMutation.mutate(item._id)
                  }
                  onToggleAvailability={(item) =>
                    toggleAvailabilityMutation.mutate(item._id)
                  }
                  onDelete={(merchantId, productId) => {
                    deleteProduct({ merchantId, productId })
                  }}
                  isUpdating={
                    toggleAvailabilityMutation.isPending ||
                    deleteProductMutation.isPending
                  }
                />
              ))}
            </div>

            <Separator />

            <p className="inline-flex gap-2 pt-4 text-lg font-semibold">
              Regular products
            </p>
            <div className="grid grid-cols-1 gap-4 pt-5 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {unfeaturedProducts.map((product) => (
                <MerchantProductCard
                  key={product._id}
                  merchantId={merchant?._id}
                  product={product}
                  onEdit={openEditDialog}
                  onToggleFeature={(item) =>
                    toggleFeatureMutation.mutate(item._id)
                  }
                  onToggleAvailability={(item) =>
                    toggleAvailabilityMutation.mutate(item._id)
                  }
                  onDelete={(merchantId, productId) => {
                    deleteProduct({ merchantId, productId })
                  }}
                  isUpdating={
                    toggleAvailabilityMutation.isPending ||
                    deleteProductMutation.isPending
                  }
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default MerchantMenuPage
