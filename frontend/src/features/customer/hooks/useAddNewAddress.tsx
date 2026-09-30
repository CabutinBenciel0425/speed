import axios from "@/lib/axios"
import type { Cart } from "../types/cart"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCartStore } from "@/store/cartStore"
import { toast } from "sonner"

const addProductNote = async ({
  note,
  productId,
}: {
  note: string
  productId: string
}): Promise<Cart> => {
  const { data } = await axios.post("/cart/product/note", { productId, note })

  return data.data
}

export const useAddProductNote = () => {
  const { setCart } = useCartStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addProductNote,
    onSuccess: (data) => {
      setCart(data)
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success("Note added successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
