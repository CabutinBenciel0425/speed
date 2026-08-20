import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TopProductTag } from "@/features/customer/types/products"

type FilterProps = {
  tags: TopProductTag[]
  value: string
  onFilterChange: (value: string) => void
}

function Filter({ tags, value, onFilterChange }: FilterProps) {
  const handleValueChange = (values: string[]) => {
    const selectedValue = values[values.length - 1] ?? "all"
    console.log(selectedValue)
    onFilterChange(selectedValue)
  }

  console.log("TAGS", tags)
  console.log("DEFAULT VALUE", value)

  return (
    <ToggleGroup
      value={[value || "all"]}
      onValueChange={handleValueChange}
      size="lg"
      variant="outline"
      spacing={2}
      className="flex-wrap"
    >
      <ToggleGroupItem value="all">All</ToggleGroupItem>

      {tags.map((tag) => (
        <ToggleGroupItem
          key={tag._id}
          value={tag._id}
          className="text-sm capitalize"
        >
          {tag._id}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default Filter
