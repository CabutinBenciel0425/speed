import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import type { FetchMerchantResponse } from "../types/merchant"

const ITEMS_PER_PAGE = 8

const fetchMerchantSearchResults = async (
  query: string,
  page: number,
  sort: string,
  open: boolean,
  minRating: number,
  maxRating: number,
  maxDist: number,
  lat?: number,
  lng?: number
) => {
  const { data } = await axios.get<FetchMerchantResponse>(
    `/merchant?search=${query}&limit=${ITEMS_PER_PAGE}&page=${page}&sort=${sort}&open=${open}&averageRating.gte=${minRating}&averageRating.lte=${maxRating}&maxDist=${maxDist}&lat=${lat}&lng=${lng}`
  )
  return data
}

export const useSearchMerchantResults = (
  query: string,
  page: number,
  sort: string,
  open: boolean,
  minRating: number,
  maxRating: number,
  maxDist: number,
  lat?: number,
  lng?: number
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "searchMerchants",
      query,
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
      fetchMerchantSearchResults(
        query,
        page,
        sort,
        open,
        minRating,
        maxRating,
        maxDist,
        lat,
        lng
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
