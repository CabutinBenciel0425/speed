import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import type { ProductFavoritePagination } from "../types/favorites"

const ITEMS_PER_PAGE = 8

const getProductFavoriteList = async (
  page: number,
  selectedCategory: string,
  price: [number, number],
  timeRange: {
    min: number
    max: number
  } | null,
  sortParams: string
): Promise<ProductFavoritePagination> => {
  let url = `/product/favorites?limit=${ITEMS_PER_PAGE}&page=${page}&sort=${sortParams}`

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

  const { data } = await axios.get(url)
  return data.data
}

export const useProductFavoriteList = (
  page: number,
  selectedCategory: string,
  price: [number, number],
  timeRange: {
    min: number
    max: number
  } | null,
  sortParams: string
) => {
  const {
    data: productFavoriteList,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "productFavoriteList",
      page,
      selectedCategory,
      price,
      timeRange,
      sortParams,
    ],
    queryFn: () =>
      getProductFavoriteList(
        page,
        selectedCategory,
        price,
        timeRange,
        sortParams
      ),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: productFavoriteList,
    isLoading,
    error,
  }
}
