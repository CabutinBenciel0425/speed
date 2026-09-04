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
  maxRating: number
) => {
  const { data } = await axios.get<FetchMerchantResponse>(
    `/merchant?search=${query}&limit=${ITEMS_PER_PAGE}&page=${page}&sort=${sort}&open=${open}&averageRating.gte=${minRating}&averageRating.lte=${maxRating}`
  )
  return data
}

export const useSearchMerchantResults = (
  query: string,
  page: number,
  sort: string,
  open: boolean,
  minRating: number,
  maxRating: number
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
    ],
    queryFn: () =>
      fetchMerchantSearchResults(query, page, sort, open, minRating, maxRating),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data,
    isLoading,
    isError,
  }
}
