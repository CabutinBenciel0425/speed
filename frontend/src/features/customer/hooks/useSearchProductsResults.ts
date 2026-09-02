import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import type { FetchProductResponse } from "../types/products"

const ITEMS_PER_PAGE = 8

const fetchProductSearchResults = async (query: string, page: number) => {
  const { data } = await axios.get<FetchProductResponse>(
    `/product?search=${query}&limit=${ITEMS_PER_PAGE}&page=${page}`
  )
  return data
}

export const useSearchProductResults = (query: string, page: number) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchProducts", query, page],
    queryFn: () => fetchProductSearchResults(query, page),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data,
    isLoading,
    isError,
  }
}
