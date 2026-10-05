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
  const params = new URLSearchParams({
    limit: String(ITEMS_PER_PAGE),
    page: String(page),
    sort,
    open: String(open),
    "averageRating.gte": String(minRating),
    "averageRating.lte": String(maxRating),
    maxDist: String(maxDist),
  })
  if (query.trim()) params.set("search", query.trim())
  if (lat !== undefined) params.set("lat", String(lat))
  if (lng !== undefined) params.set("lng", String(lng))
  const { data } = await axios.get<FetchMerchantResponse>(
    `/merchant?${params.toString()}`
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
