import axios from "@/lib/axios"
import type { SearchDropdownResults } from "@/types/search"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchSearchDropdownResults = async (value: string) => {
  const { data } = await axios.get<ApiResponse<SearchDropdownResults>>(
    `/search/suggest/public?query=${value}`
  )

  return data
}

export const useSearchDropdownPublic = (value: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchDropdownResultsPublic", value],
    queryFn: () => fetchSearchDropdownResults(value),
    enabled: !!value.trim(),
    select: (response: ApiResponse<SearchDropdownResults>) => response.data,
  })

  return {
    merchants: data?.merchants || [],
    products: data?.products || [],
    isLoading,
    isError,
  }
}
