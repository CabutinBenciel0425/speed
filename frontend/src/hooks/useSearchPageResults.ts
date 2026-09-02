import axios from "@/lib/axios"
import type { SearchPageResultsType } from "@/types/search"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchSearchPageResults = async (searchTerm: string) => {
  const { data } = await axios.get<ApiResponse<SearchPageResultsType>>(
    `/search/public?limit=4&search=${searchTerm}`
  )

  return data.data
}

export const useSearchPageResults = (query: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchPageResultsPublic", query],
    queryFn: () => fetchSearchPageResults(query),
    enabled: !!query,
  })

  return { data, isLoading, isError }
}
