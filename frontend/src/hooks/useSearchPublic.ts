import axios from "@/lib/axios"
import type { SearchResults } from "@/types/search"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchSearchResults = async (value: string) => {
  const { data } = await axios.get<ApiResponse<SearchResults>>(
    `/search/suggest/public?query=${value}`
  )

  return data
}

export const useSearchPublic = (value: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchResultsPublic", value],
    queryFn: () => fetchSearchResults(value),
    enabled: !!value.trim(),
    select: (response: ApiResponse<SearchResults>) => response.data,
  })

  return {
    merchants: data?.merchants || [],
    products: data?.products || [],
    isLoading,
    isError,
  }
}
