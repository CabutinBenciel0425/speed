import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { FilterProps } from "../types/PropTypes"

function Filter({ tags, value, onFilterChange }: FilterProps) {
  const handleValueChange = (values: string[]) => {
    const selectedValue = values[values.length - 1] ?? "all"
    onFilterChange(selectedValue)
  }

  return (
    <ToggleGroup
      value={[value || "all"]}
      onValueChange={handleValueChange}
      size="lg"
      variant="outline"
      spacing={4}
      className="flex-wrap"
    >
      <ToggleGroupItem value="all">All</ToggleGroupItem>

      {tags.map((tag) => (
        <ToggleGroupItem
          key={tag._id}
          value={tag._id}
          className={`text-sm capitalize ${tag._id === value ? "scale-110" : ""}`}
        >
          {tag._id}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default Filter
