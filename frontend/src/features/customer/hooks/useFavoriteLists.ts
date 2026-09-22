import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"
import type { FavoriteLists } from "../types/favorites"

const getFavoriteLists = async () => {
  const { data } = await axios.get<ApiResponse<FavoriteLists>>(
    `/favorites/result?limit=4`
  )

  return data.data
}

export const useFavoriteLists = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["FavoriteLists"],
    queryFn: getFavoriteLists,
  })

  return { data, isLoading, error }
}
