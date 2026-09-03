import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import type { FetchMerchantResponse } from "../types/merchant"

const ITEMS_PER_PAGE = 8

const fetchMerchantSearchResults = async (
  query: string,
  page: number,
  sort: string
) => {
  const { data } = await axios.get<FetchMerchantResponse>(
    `/merchant?search=${query}&limit=${ITEMS_PER_PAGE}&page=${page}&sort=${sort}`
  )
  console.log(sort)
  return data
}

export const useSearchMerchantResults = (
  query: string,
  page: number,
  sort: string
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchMerchants", query, page, sort],
    queryFn: () => fetchMerchantSearchResults(query, page, sort),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data,
    isLoading,
    isError,
  }
}
