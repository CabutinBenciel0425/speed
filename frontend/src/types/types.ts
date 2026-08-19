export interface ApiResponse<T> {
  status: string
  data: T
}

export type Result<T, E = Error> = { data: T } | { error: E }
