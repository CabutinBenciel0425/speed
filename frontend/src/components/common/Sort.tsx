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
  margin = 15,
}: {
  children: React.ReactNode
  value: string
  margin?: number
}) {
  return (
    <div className={`mr-${margin}`}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className={"text-xs font-semibold lg:text-sm"}
            >
              <span className="text-xs text-muted-foreground lg:text-sm">
                Sort by:{" "}
              </span>
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
