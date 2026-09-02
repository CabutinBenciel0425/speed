import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { PaginationProps } from "../types/PropTypes"

export function PaginationPage({
  currentPage,
  onPageChange,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => handlePrevious(e)}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {[...Array(totalPages)].map((_, i) => {
          const pageNumber = i + 1
          return (
            <PaginationItem
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
            >
              <PaginationLink href="#" isActive={pageNumber === currentPage}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => handleNext(e)}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
