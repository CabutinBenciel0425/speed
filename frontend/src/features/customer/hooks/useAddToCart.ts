import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CartResult } from "../types/cart"
import { toast } from "sonner"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "../types/products"

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
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
