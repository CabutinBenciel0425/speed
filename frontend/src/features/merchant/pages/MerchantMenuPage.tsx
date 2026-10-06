import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Dot, Plus } from "lucide-react"
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

function MerchantMenuPage() {
  const { categories } = useCategories()
  const {
    merchant,
    isLoading: isLoadingMerchant,
    error: merchantError,
  } = useMyMerchantProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get("category") ?? ""
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const productsQuery = useMerchantMenuProducts(merchant?._id, categoryId)
  const allProductsQuery = useMerchantMenuProducts(merchant?._id, "")
  const addProductMutation = useAddMerchantProduct(merchant?._id)
  const updateProductMutation = useUpdateMerchantProduct(merchant?._id)
  const {
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

  const products = productsQuery.data ?? []
  const allProducts = allProductsQuery.data ?? []

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
    return <div className="w-full p-8 text-muted-foreground">Loading menu…</div>
  }
  if (merchantError || !merchant) {
    return (
      <div className="w-full p-8 text-destructive">
        Could not load your merchant profile.
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="mb-5 flex items-center gap-4">
          <div className="size-16 overflow-hidden rounded-xl border bg-white shadow-sm sm:size-20">
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
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 sm:text-sm">
              <span>
                {categoryList
                  .slice(0, 3)
                  .map((item) => item.name)
                  .join(" · ")}
              </span>
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
          className="flex items-center gap-2 bg-orange-500 px-5 text-white hover:bg-orange-600"
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
          getCategoryCount={(id) =>
            allProducts.filter((product) => product.category === id).length
          }
        />

        {productsQuery.isLoading || allProductsQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading products…
          </p>
        ) : productsQuery.isError || allProductsQuery.isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Could not load products. Please refresh and try again.
          </p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {categoryId
              ? "No products in this category."
              : "No products yet. Add your first menu item."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <MerchantProductCard
                key={product._id}
                product={product}
                onEdit={openEditDialog}
                onToggleAvailability={(item) =>
                  toggleAvailabilityMutation.mutate(item._id)
                }
                onDelete={(item) => {
                  if (window.confirm(`Delete “${item.name}” from your menu?`)) {
                    deleteProductMutation.mutate(item._id)
                  }
                }}
                isUpdating={
                  toggleAvailabilityMutation.isPending ||
                  deleteProductMutation.isPending
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MerchantMenuPage
