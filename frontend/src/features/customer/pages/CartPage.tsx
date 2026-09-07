import CartProductCard from "../components/CartProductCard"

function CartPage() {
  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <h3 className="text-xl font-normal text-muted-foreground">
          Good food is always a good idea
        </h3>
      </div>
      <div>
        <div>
          <CartProductCard />
        </div>
      </div>
    </div>
  )
}

export default CartPage
