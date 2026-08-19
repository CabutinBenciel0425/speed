import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Category } from "../types/category"
import type { ApiResponse } from "@/types/types"

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await axios.get<ApiResponse<Category[]>>("/category")

  return data.data
}

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  return { categories, isLoading, error }
}
