import { MapPin } from "lucide-react"

function AddressPage() {
  return (
    <div className="relative flex w-full flex-col items-center px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex w-full max-w-7xl flex-row items-center gap-5 2xl:max-w-375">
        <MapPin className="size-10 rounded-full bg-primary p-2" stroke="#fff" />
        <div>
          <h1 className="mb-1 text-lg font-bold sm:text-xl 2xl:text-2xl">
            Your Addresses
          </h1>
        </div>
      </div>

      {/* {cartItems && cartItems.length > 0 ? (
        <>
          <div className="mt-5 flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-start xl:gap-8 2xl:max-w-375">
            <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3 lg:flex-1">
              {cart.items.map((item) => (
                <CartItemCard
                  item={item}
                  onHandleDelete={handleDelete}
                  isDeleting={deletingProduct === item.product._id}
                  key={item.product._id}
                />
              ))}

              <div className="mt-2 flex w-full items-center justify-start">
                <Button
                  variant="ghost"
                  className="gap-2 text-sm text-muted-foreground/50 hover:text-destructive"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Trash2 className="size-4" />
                  <span>Clear Cart</span>
                </Button>
              </div>
            </div>

            <div className="w-full lg:sticky lg:top-5 lg:w-80 lg:shrink-0 xl:w-95 2xl:w-105">
              <OrderSummary
                subtotal={cart?.pricing.subtotal}
                deliveryFee={cart?.pricing.deliveryFee}
                totalItems={cart?.items.length}
                total={cart?.pricing.total}
                deliveryTime={totalEstimatedDeliveryTime}
                customerNote={cart.customerNote}
                isMerchantOpen={cart?.merchant.isOpen}
                cartId={cart._id}
              />
            </div>
          </div>

          <section className="mt-10 w-full max-w-7xl 2xl:max-w-375">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold lg:text-2xl">
                You might also like
              </h2>
            </div>

            <RandomProducts
              productIds={cartProductIds}
              limit={5}
              merchantId={merchantId}
            />
          </section>
        </>
      ) : (
        <div className="mt-20 flex w-full flex-col items-center justify-center gap-3">
          <BsCartX className="size-20 text-muted-foreground/50" />

          <p className="text-sm text-muted-foreground/50">
            You have no items in your cart.
          </p>

          <NavLink
            to="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            Go back to homepage
          </NavLink>
        </div>
      )} */}
    </div>
  )
}

export default AddressPage
