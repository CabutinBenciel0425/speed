// frontend/src/store/cartStore.ts
import type { Cart, CartItem } from "@/features/customer/types/cart"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartStore {
  cart: Cart | null
  isLoading: boolean
  itemCount: number
  totalPrice: number
  setCart: (cart: Cart) => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setLoading: (loading: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      itemCount: 0,
      totalPrice: 0,

      setCart: (cart) =>
        set({
          cart,
          itemCount: cart?.items?.length || 0,
          totalPrice: cart?.pricing?.total || 0,
        }),

      addItem: (item) => {
        const { cart } = get()
        if (!cart) return

        const existingItem = cart.items.find((i) => i.product === item.product)

        let newItems
        if (existingItem) {
          newItems = cart.items.map((i) =>
            i.product === item.product
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          newItems = [...cart.items, item]
        }

        const updatedCart = {
          ...cart,
          items: newItems,
        }
        set({ cart: updatedCart })
      },

      removeItem: (productId) => {
        const { cart } = get()
        if (!cart) return

        const newItems = cart.items.filter((i) => i.product !== productId)
        set({
          cart: { ...cart, items: newItems },
        })
      },

      updateQuantity: (productId, quantity) => {
        const { cart } = get()
        if (!cart) return

        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const newItems = cart.items.map((i) =>
          i.product === productId ? { ...i, quantity } : i
        )
        set({
          cart: { ...cart, items: newItems },
        })
      },

      clearCart: () => set({ cart: null, itemCount: 0, totalPrice: 0 }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cart: state.cart,
        itemCount: state.itemCount,
        totalPrice: state.totalPrice,
      }),
    }
  )
)
