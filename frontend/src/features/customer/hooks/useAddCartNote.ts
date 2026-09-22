import axios from "@/lib/axios"
import type { Cart } from "../types/cart"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCartStore } from "@/store/cartStore"
import { toast } from "sonner"

const addCartNote = async ({
  note,
  cartId,
}: {
  note: string
  cartId: string
}): Promise<Cart> => {
  const { data } = await axios.post("/cart/note", { cartId, note })

  return data.data
}

export const useAddCartNote = () => {
  const { setCart } = useCartStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addCartNote,
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
