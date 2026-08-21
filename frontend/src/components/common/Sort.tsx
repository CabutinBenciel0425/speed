import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatSortTitle } from "@/utils/formatSortTitle"

type SortProps = {
  value: string
  onSortChange: (value: string) => void
}

function Sort({ value, onSortChange }: SortProps) {
  return (
    <div className="mr-15">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline">
              <span className="text-md text-muted-foreground">Sort by: </span>
              {formatSortTitle(value)}
            </Button>
          }
        />
        <DropdownMenuContent className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sort products by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={value} onValueChange={onSortChange}>
              <DropdownMenuRadioItem value="-price">
                <span className="text-md font-semibold">Price</span>
                <span className="text-muted-foreground">Highest to Lowest</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price">
                <span className="text-md font-semibold">Price</span>
                <span className="text-muted-foreground">Lowest to Highest</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">
                <span className="text-md font-semibold">Name</span>
                <span className="text-muted-foreground">A to Z</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="-name">
                <span className="text-md font-semibold">Name</span>
                <span className="text-muted-foreground">Z to A</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Sort
