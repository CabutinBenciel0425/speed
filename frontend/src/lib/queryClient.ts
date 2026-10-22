import { QueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response?.status === 401) {
          return false
        }
        return failureCount < 2
      },
      staleTime: 1000 * 60 * 5, //5 mins
    },
  },
})
