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
import type { Address, AddressLabel } from "@/types/address"
import type { MouseEvent } from "react"
import {
  BriefcaseBusiness,
  Home,
  MapPin,
  Pencil,
  PencilIcon,
  Trash,
  TrashIcon,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

type AddressCard = {
  address: Address
  labelDeleting: AddressLabel | null
  onHandleAddressChange: (
    e: MouseEvent<HTMLDivElement>,
    value: AddressLabel
  ) => void
  onHandleAddressEdit: (values: Address) => void
  onHandleAddressDelete: (label: AddressLabel) => void
}

function AddressCard({
  address,
  labelDeleting,
  onHandleAddressChange,
  onHandleAddressEdit,
  onHandleAddressDelete,
}: AddressCard) {
  const {
    label,
    houseOrUnitNumber,
    street,
    barangay,
    city,
    province,
    phoneNumber,
    recipientName,
    isDefault,
  } = address
  const formattedAddress = `${houseOrUnitNumber || ""} ${street} ${barangay}, ${city} ${province ? `, ${province}` : ""}`
  return (
    <div
      className={`flex w-full flex-row gap-4 rounded-xl border bg-background/20 p-3 shadow-xs sm:p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:p-4 2xl:h-30 2xl:gap-8 2xl:px-5 ${isDefault ? "border-primary bg-primary/10" : "border-muted-foreground/10"} transition duration-300 ease-in-out hover:border-primary hover:bg-primary/10`}
      onClick={(e) => onHandleAddressChange(e, label)}
    >
      <div className="flex items-center justify-center">
        {label === "Home" && (
          <Home
            className={`border p-2 text-foreground ${isDefault ? "border-primary text-primary" : "bg-muted-foreground/10 text-foreground"} size-8 rounded-md shadow-sm lg:size-10 2xl:size-12`}
          />
        )}

        {label === "Work" && (
          <BriefcaseBusiness
            className={`border p-2 ${isDefault ? "border-primary text-primary" : "bg-muted-foreground/10 text-foreground"} size-8 rounded-md shadow-sm lg:size-10 2xl:size-12`}
          />
        )}

        {label === "Other" && (
          <MapPin
            className={`border p-2 ${isDefault ? "border-primary text-primary" : "bg-muted-foreground/10 text-foreground"} size-8 rounded-md shadow-sm lg:size-10 2xl:size-12`}
          />
        )}
      </div>

      <div className="flex w-1/2 flex-col gap-2">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xs font-semibold md:text-sm lg:text-base">
            {label}
          </h2>

          {isDefault && (
            <Badge className="px-2 text-xs lg:px-3 lg:text-sm">Default</Badge>
          )}
        </div>
        <div>
          <p className="line-clamp-2 truncate text-xs text-muted-foreground lg:text-sm">
            {formattedAddress}
          </p>
        </div>

        <div>
          <p className="flex flex-row items-center justify-start gap-2 text-xs text-muted-foreground lg:text-sm">
            <span>{recipientName}</span>
            <span>{phoneNumber}</span>
          </p>
        </div>
      </div>

      <div className="flex w-1/2 flex-row items-center justify-end gap-2">
        <Button
          variant={"secondary"}
          size="icon"
          className={"hidden md:flex"}
          onClick={(e) => {
            e.stopPropagation()
            onHandleAddressEdit(address)
          }}
        >
          <Pencil />
        </Button>
        <Button
          variant={"destructive"}
          size="icon"
          className={"hidden md:flex"}
          onClick={(e) => {
            e.stopPropagation()
            onHandleAddressDelete(address.label)
          }}
        >
          {labelDeleting === address.label ? <Spinner /> : <Trash />}
        </Button>

        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="secondary"
                  className={`border px-2 py-0 text-2xl font-bold ${isDefault ? "border-primary/50 text-primary" : "border-muted-foreground bg-transparent text-muted-foreground"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  ⋯
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onHandleAddressEdit(address)
                  }}
                >
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
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
