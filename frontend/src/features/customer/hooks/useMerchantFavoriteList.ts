import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { MerchantFavoritePagination } from "../types/favorites"

const ITEMS_PER_PAGE = 8

const getMerchantFavoriteList = async (
  page: number,
  sort: string,
  open: boolean,
  minRating: number,
  maxRating: number,
  maxDist: number,
  lat?: number,
  lng?: number
): Promise<MerchantFavoritePagination> => {
  const { data } = await axios.get(
    `/merchant/favorites?limit=${ITEMS_PER_PAGE}&page=${page}&sort=${sort}&open=${open}&averageRating.gte=${minRating}&averageRating.lte=${maxRating}&maxDist=${maxDist}&lat=${lat}&lng=${lng}`
  )
  return data.data
}

export const useMerchantFavoriteList = (
  page: number,
  sort: string,
  open: boolean,
  minRating: number,
  maxRating: number,
  maxDist: number,
  lat?: number,
  lng?: number
) => {
  const {
    data: merchantFavoriteList,
    isLoading,
    error,
  } = useQuery<MerchantFavoritePagination>({
    queryKey: [
      "merchantFavoriteList",
      page,
      sort,
      open,
      minRating,
      maxRating,
      maxDist,
      lat,
      lng,
    ],
    queryFn: () =>
      getMerchantFavoriteList(
        page,
        sort,
        open,
        minRating,
        maxRating,
        maxDist,
        lat,
        lng
      ),
  })

  return { merchantFavoriteList, isLoading, error }
}
