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
  } | null
) => {
  let url = `/product?search=${encodeURIComponent(query)}&limit=${ITEMS_PER_PAGE}&page=${page}`

  if (
    selectedCategory &&
    selectedCategory !== "All" &&
    selectedCategory !== ""
  ) {
    url += `&category=${selectedCategory}`
  }
  if (price) {
    if (price[0] !== price[1]) {
      url += `&price.gte=${price[0]}&price.lte=${price[1]}`
    } else {
      url += `&price.gt=${price[0]}`
    }
  }
  if (timeRange) {
    url += `&preparationTime.gte=${timeRange.min}`

    if (isFinite(timeRange.max)) {
      url += `&preparationTime.lte=${timeRange.max}`
    }
  }
  const { data } = await axios.get<FetchProductResponse>(url)
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
  } | null
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "searchProducts",
      query,
      page,
      selectedCategory,
      price,
      timeRange,
    ],
    queryFn: () =>
      fetchProductSearchResults(
        query,
        page,
        selectedCategory,
        price,
        timeRange
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
