import axios from "@/lib/axios"
import type { SearchPageResults } from "@/types/search"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchSearchPageResults = async (query: string) => {
  const { data } = await axios.get<ApiResponse<SearchPageResults>>(
    `/search/public?query=${query}`
  )
  console.log(data)
  return data
}

export const useSearchPageResults = (query: string) => {
  console.log(query)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchPageResultsPublic", query],
    queryFn: () => fetchSearchPageResults(query),
    enabled: !!query,
    select: (response: ApiResponse<SearchPageResults>) => response.data,
  })

  return { data, isLoading, isError }
}
