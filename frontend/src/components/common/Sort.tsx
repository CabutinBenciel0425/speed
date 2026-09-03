import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatSortTitle } from "@/utils/formatSortTitle"

function Sort({
  children,
  value,
}: {
  children: React.ReactNode
  value: string
}) {
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
          <DropdownMenuGroup>{children}</DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Sort
