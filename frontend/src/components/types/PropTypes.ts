import type { TopProductTag } from "@/features/customer/types/products"
import type { Dispatch, SetStateAction } from "react"
import type { FieldError } from "react-hook-form"

export type FieldStateType = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  isValidating: boolean
  error?: FieldError
}

export type FilterProps = {
  tags: TopProductTag[]
  value: string
  onFilterChange: (value: string) => void
}

export type SortProps = {
  value: string
  onSortChange: (value: string) => void
}

export type PaginationProps = {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}

export type CategoryHeaderProps = {
  name: string
  description: string
  image: string
}

export type Pages = {
  link: string
  pageName: string
}

export type BreadcrumbLinkComponent = {
  pages?: Pages[]
  currentPage: string
}

export type LikeButtonProps = {
  isFavorite: boolean
  setIsFavorite: (value: boolean) => void
  baseSize: number
}

export type ToggleQuantityProps = {
  quantity: number
  onQuantityChange: Dispatch<SetStateAction<number>>
}
