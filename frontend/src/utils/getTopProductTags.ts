import type { Product } from "@/features/customer/types/products"

export const getTopProductTags = (
  products: Product[],
  limit: number = 5
): string[] => {
  if (!products || products.length === 0) return []

  const allTags = products.flatMap((product) => product.tags)

  const tagCounts: Record<string, number> = {}
  allTags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  })

  const sortedTags = Object.entries(tagCounts)
    .sort(([tagA, countA], [tagB, countB]) => {
      if (countB !== countA) return countB - countA

      return tagA.localeCompare(tagB)
    })
    .map(([tag]) => tag)

  return sortedTags.slice(0, limit)
}
