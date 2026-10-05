import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import type { FetchProductResponse } from "../types/products"

const ITEMS_PER_PAGE = 8

const fetchProductSearchResults = async (
  query: string,
  page: number,
  selectedCategory: string,
  price: [number, number],
  timeRange: {
    min: number
    max: number
  } | null,
  sortParams: string
) => {
  const params = new URLSearchParams({
    search: query,
    limit: String(ITEMS_PER_PAGE),
    page: String(page),
    sort: sortParams,
  })

  if (
    selectedCategory &&
    selectedCategory !== "All" &&
    selectedCategory !== ""
  ) {
    params.set("category", selectedCategory)
  }
  if (price && Number.isFinite(price[0]) && Number.isFinite(price[1])) {
    params.set("price.gte", String(price[0]))
    params.set("price.lte", String(price[1]))
  }
  if (timeRange) {
    params.set("preparationTime.gte", String(timeRange.min))

    if (isFinite(timeRange.max)) {
      params.set("preparationTime.lte", String(timeRange.max))
    }
  }

  const { data } = await axios.get<FetchProductResponse>(
    `/product?${params.toString()}`
  )
  return data
}

export const useSearchProductResults = (
  query: string,
  page: number,
  selectedCategory: string,
  price: [number, number],
  timeRange: {
    min: number
    max: number
  } | null,
  sortParams: string
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "searchProducts",
      query,
      page,
      selectedCategory,
      price,
      timeRange,
      sortParams,
    ],
    queryFn: () =>
      fetchProductSearchResults(
        query,
        page,
        selectedCategory,
        price,
        timeRange,
        sortParams
      ),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data,
    isLoading,
    isError,
  }
}
