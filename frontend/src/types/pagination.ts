export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationMeta
}
