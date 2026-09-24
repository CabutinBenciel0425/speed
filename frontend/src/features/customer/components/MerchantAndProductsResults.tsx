import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import { BsShop } from "react-icons/bs"
import { NavLink } from "react-router-dom"
import { LiaBoxOpenSolid } from "react-icons/lia"
import { ChevronDown } from "lucide-react"
import ProductCard from "@/components/common/ProductCard"
import MerchantCard from "@/components/common/MerchantCard"
import type { FavoriteListsPageProps } from "../types/favorites"

function MerchantAndProductResults({
  products,
  merchants,
  isLoading,
  error,
}: FavoriteListsPageProps) {
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p className="text-red-500">Failed to load search results</p>
      </div>
    )
  }

  const hasMerchants = merchants && merchants?.merchants.length > 0
  const hasProducts = products && products?.products.length > 0

  if (!hasMerchants && !hasProducts) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
        <div className="rounded-full bg-muted/50 p-6">
          <LiaBoxOpenSolid className="size-12 text-muted-foreground/50" />
        </div>
        <p className="text-lg text-muted-foreground">No results found</p>
        <p className="text-sm text-muted-foreground/60">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {hasMerchants && (
        <Accordion
          multiple

          defaultValue={["merchants"]}
          className="w-full"
        >
          <AccordionItem value="merchants" className="border-0">
            <AccordionTrigger className="group flex w-full min-w-58 items-center justify-between rounded-xl bg-muted/30 px-6 py-4 hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <BsShop className="size-5 text-primary" />
                </div>
                <span className="text-base font-semibold">Merchants</span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {merchants.pagination.total}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </AccordionTrigger>

            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 px-8 py-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {merchants.merchants.map((merchant) => (
                  <MerchantCard
                    key={merchant._id}
                    merchant={merchant.merchant}
                  />
                ))}
              </div>

              {merchants.pagination.total > 4 && (
                <div className="mt-4 flex justify-center">
                  <NavLink
                    to={`/favorites/merchants`}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    style={{ textDecoration: "none" }}
                  >
                    View all {merchants.pagination.total} merchants →
                  </NavLink>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {hasProducts && (
        <Accordion multiple defaultValue={["products"]} className="w-full">
          <AccordionItem value="products" className="border-0">
            <AccordionTrigger className="group flex w-full items-center justify-between rounded-xl bg-muted/30 px-6 py-4 hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <LiaBoxOpenSolid className="size-5 text-primary" />
                </div>
                <span className="text-base font-semibold">Products</span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {products.pagination.total}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </AccordionTrigger>

            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 px-8 py-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.products.map((product) => (
                  <ProductCard key={product._id} product={product.product} />
                ))}
              </div>

              {products.pagination.total > 4 && (
                <div className="mt-4 flex justify-center">
                  <NavLink
                    to={`/favorites/products`}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:no-underline"
                    style={{ textDecoration: "none" }}
                  >
                    View all {products.pagination.total} products →
                  </NavLink>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

export default MerchantAndProductResults
