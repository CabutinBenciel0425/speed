import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CartItem, CartResult } from "../types/cart"
import { toast } from "sonner"
import { useCartStore } from "@/store/cartStore"

export const addToCart = async (item: CartItem): Promise<CartResult> => {
  const { data } = await axios.post("/cart", item)
  return data.data
}

export const useAddToCart = (item: CartItem) => {
  const queryClient = useQueryClient()
  const { addItem } = useCartStore()
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      toast.success("Item added to cart")
      addItem(item)

      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error) => {
      console.log("ADDTOCART MUTATION ERROR", error)
      toast.error("Error on adding the item")
    },
  })
}
