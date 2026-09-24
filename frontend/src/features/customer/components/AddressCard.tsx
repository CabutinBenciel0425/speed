import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AddressLabel } from "@/types/address"
import {
  BriefcaseBusiness,
  Home,
  MapPin,
  Pencil,
  PencilIcon,
  Trash,
  TrashIcon,
} from "lucide-react"

type AddressCard = {
  type: AddressLabel
  address: string
  isDefault?: boolean
  onHandleAddressChange: (value: AddressLabel) => void
}

function AddressCard({
  type,
  address,
  isDefault,
  onHandleAddressChange,
}: AddressCard) {
  return (
    <div
      className={`flex w-full flex-row gap-4 rounded-xl border bg-background/20 p-3 shadow-xs sm:p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:p-4 2xl:h-30 2xl:gap-8 2xl:px-5 ${isDefault ? "border-primary bg-primary/10" : "border-muted-foreground/10"} transition duration-300 ease-in-out hover:border-primary hover:bg-primary/10`}
      onClick={() => onHandleAddressChange(type)}
    >
      <div className="flex items-center justify-center">
        {type === "Home" && (
          <Home
            className={`border p-2 text-foreground ${isDefault ? "border-primary text-primary" : "bg-muted-foreground/10 text-foreground"} size-8 rounded-md shadow-sm lg:size-10 2xl:size-12`}
          />
        )}

        {type === "Work" && (
          <BriefcaseBusiness
            className={`border p-2 ${isDefault ? "border-primary text-primary" : "bg-muted-foreground/10 text-foreground"} size-8 rounded-md shadow-sm lg:size-10 2xl:size-12`}
          />
        )}

        {type === "Other" && (
          <MapPin
            className={`border p-2 ${isDefault ? "border-primary text-primary" : "bg-muted-foreground/10 text-foreground"} size-8 rounded-md shadow-sm lg:size-10 2xl:size-12`}
          />
        )}
      </div>

      <div className="flex w-1/2 flex-col gap-2">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xs font-semibold md:text-sm lg:text-base">
            {type}
          </h2>

          {isDefault && (
            <Badge className="px-2 text-xs lg:px-3 lg:text-sm">Default</Badge>
          )}
        </div>
        <div>
          <p className="line-clamp-2 truncate text-xs text-muted-foreground lg:text-sm">
            {address}
          </p>
        </div>
      </div>

      <div className="flex w-1/2 flex-row items-center justify-end gap-2">
        <Button variant={"secondary"} size="icon" className={"hidden md:flex"}>
          <Pencil />
        </Button>
        <Button
          variant={"destructive"}
          size="icon"
          className={"hidden md:flex"}
        >
          <Trash />
        </Button>

        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="secondary"
                  className={`border px-2 py-0 text-2xl font-bold ${isDefault ? "border-primary/50 text-primary" : "border-muted-foreground bg-transparent text-muted-foreground"}`}
                >
                  ⋯
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default AddressCard
