import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CartResult } from "../types/cart"
import { toast } from "sonner"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "../types/products"
import type { AxiosError } from "axios"

export const addToCart = async ({
  product,
  quantity,
  notes = "",
}: {
  product: Product
  quantity: number
  notes?: string
}): Promise<CartResult> => {
  const { data } = await axios.post("/cart", {
    product: product._id,
    quantity,
    notes,
  })
  return data.data
}

export const useAddToCart = ({
  product,
  quantity,
  notes,
}: {
  product: Product
  quantity: number
  notes?: string
}) => {
  const queryClient = useQueryClient()
  const { addItem } = useCartStore()
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      toast.success("Item added to cart")
      addItem({
        id: product._id,
        product,
        quantity,
        notes,
      })

      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || ""
      if (
        error.response?.status === 409 &&
        /cart contains items from another (restaurant|store)/i.test(message)
      ) {
        toast.error("This item is from a different store", {
          description:
            "Your cart already has items from another store. Clear your cart before adding this item.",
        })
        return
      }

      toast.error(message || "Something went wrong. Please try again.")
    },
  })
}
