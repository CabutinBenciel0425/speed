import type { SelectedMerchant } from "@/features/customer/types/merchant"
import type { SelectedProductWithMerchant } from "@/features/customer/types/products"
import { NavLink } from "react-router-dom"
import { Spinner } from "../../../components/ui/spinner"

function SearchDropdown({
  products,
  merchants,
  isDropdownOpen,
  isLoading,
}: {
  products: SelectedProductWithMerchant[]
  merchants: SelectedMerchant[]
  isDropdownOpen: boolean
  isLoading: boolean
}) {
  return (
    <div
      className={`absolute top-8 left-0 z-99 h-fit max-h-100 w-full overflow-y-auto rounded-md border border-primary bg-background px-2 pt-4 md:top-10 ${isDropdownOpen ? "block" : "hidden"} `}
    >
      {isLoading && (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          <Spinner className="size-4" />
        </div>
      )}

      {products.length === 0 && merchants.length === 0 && !isLoading && (
        <div className="p-4 text-center text-muted-foreground">
          No data found
        </div>
      )}

      {merchants.length > 0 && (
        <ul>
          <h1 className="mb-2 text-lg font-semibold">Merchants</h1>
          {merchants.map((merchant) => (
            <NavLink to={`/merchant/${merchant._id}`}>
              <li
                key={merchant.merchantName}
                value={merchant.merchantName}
                className="flex flex-row items-center justify-start gap-5 border-b border-b-muted-foreground/10"
              >
                <div>
                  <img
                    src={merchant.logo}
                    alt={merchant.merchantName}
                    className="h-15 w-15"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
                  <span className="text-md font-semibold">
                    {merchant.merchantName}
                  </span>
                  <span className="w-full truncate text-sm text-muted-foreground/40">
                    {merchant.description}
                  </span>
                </div>
              </li>
            </NavLink>
          ))}

          {products.length > 0 && (
            <ul>
              <h1 className="mt-5 text-lg font-semibold">Products</h1>
              {products.map((product) => (
                <NavLink to={`/merchant/${product.merchant}/${product._id}`}>
                  <li
                    key={product.name}
                    value={product.name}
                    className="flex w-full flex-row items-center justify-start gap-5 border-b border-b-muted-foreground/10 hover:bg-muted-foreground/10"
                  >
                    <div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-20 w-20"
                      />
                    </div>
                    <div className="flex w-full flex-row items-center justify-start">
                      <div className="w-2/5">
                        <span className="text-sm text-muted-foreground">
                          {product.merchantName}
                        </span>
                        <h3 className="text-md flex-nowrap font-semibold">
                          {product.name}
                        </h3>
                      </div>
                      <div className="w-1/5">
                        <span className="text-md w-1/3 font-semibold">
                          ₱{product.price}
                        </span>
                      </div>
                      <div className="w-2/5">
                        <span className="mt-0.5 text-sm text-muted-foreground/40">
                          {product.ingredients.join(", ")}
                        </span>
                      </div>
                    </div>
                  </li>
                </NavLink>
              ))}
            </ul>
          )}
        </ul>
      )}
    </div>
  )
}

export default SearchDropdown
