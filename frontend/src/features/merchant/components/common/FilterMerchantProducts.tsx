type CategoryOption = {
  id: string
  name: string
  slug: string
}

type FilterMerchantProductsProps = {
  categories: CategoryOption[]
  categoryId: string
  onSelect: (categoryId: string) => void
  allCount: number
  getCategoryCount: (categoryId: string) => number
}

const emojis: Record<string, string> = {
  burgers: "🍔",
  pasta: "🍝",
  pastas: "🍝",
  "rice meals": "🍛",
  drinks: "🥤",
  desserts: "🧁",
  chicken: "🍗",
  pizzas: "🍕",
  pizza: "🍕",
  soups: "🍜",
}

const categoryEmoji = (name: string) => emojis[name.toLowerCase()] ?? "🍽️"

function FilterMerchantProducts({
  categories,
  categoryId,
  onSelect,
  allCount,
  getCategoryCount,
}: FilterMerchantProductsProps) {
  const categoryButtonClass = (selected: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors transition-all duration-300 ease-in ${selected ? "scale-110" : ""}`

  return (
    <div
      className="flex max-w-full gap-4 overflow-x-auto px-4 py-2"
      role="group"
      aria-label="Filter products by category"
    >
      <button
        type="button"
        aria-pressed={!categoryId}
        onClick={() => onSelect("")}
        className={categoryButtonClass(!categoryId)}
      >
        All Items <span className="text-xs opacity-75">{allCount}</span>
      </button>
      {categories.map((category) => {
        const selected = category.id === categoryId
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected ? "" : category.id)}
            className={categoryButtonClass(selected)}
          >
            <span aria-hidden="true">{categoryEmoji(category.name)}</span>
            {category.name}
            <span className="text-xs opacity-75">
              {getCategoryCount(category.id)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default FilterMerchantProducts
