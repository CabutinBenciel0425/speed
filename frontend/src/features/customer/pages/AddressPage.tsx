import { MapPin, Plus } from "lucide-react"
import { useAddressStore } from "@/store/addressStore"
import AddressCard from "../components/AddressCard"
import { useToggleDefaultAddress } from "@/hooks/useToggleDefaultAddress"
import type { AddressLabel } from "@/types/address"
import { Button } from "@/components/ui/button"

import AddressInfo from "../components/AddressInfo"

function AddressPage() {
  const { addresses } = useAddressStore()
  const { mutate: toggleDefault } = useToggleDefaultAddress()

  const handleAddressChange = (label: AddressLabel) => {
    toggleDefault(label)
  }

  return (
    <div className="relative flex w-full flex-col items-center px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex w-full max-w-7xl flex-row items-center gap-5 2xl:max-w-375">
        <MapPin className="size-10 rounded-full bg-primary p-2" stroke="#fff" />
        <div>
          <h1 className="mb-1 text-lg font-bold sm:text-xl 2xl:text-2xl">
            Your Addresses
          </h1>
        </div>
      </div>

      <div className="mt-5 flex w-full max-w-7xl flex-col items-center gap-6 lg:flex-row lg:items-start xl:gap-8 2xl:max-w-375">
        <div className="flex w-3/4 flex-col">
          <div className="mb-3 flex w-full items-center justify-end">
            <span className="text-xs text-muted-foreground font-stretch-semi-condensed lg:text-sm">
              {addresses.length}/3 used
            </span>
          </div>
          <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3 lg:flex-1">
            {addresses.map((address) => (
              <AddressCard
                type={address.label}
                address={`${address.street} ${address.barangay} ${address.city}, ${address.province}`}
                isDefault={address.isDefault}
                onHandleAddressChange={handleAddressChange}
              />
            ))}
          </div>
          <div className="mt-10 flex w-full min-w-0 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/50 bg-muted-foreground/10 px-10 py-3 lg:flex-1">
            <Button
              variant={"ghost"}
              className={
                "flex cursor-pointer flex-row items-center justify-center text-base"
              }
            >
              <Plus className="size-5" />
              <span className="mt-0.5 text-sm lg:text-base">
                {" "}
                Add New Address
              </span>
            </Button>
            {addresses.length === 2 && (
              <div className="flex flex-col items-center justify-center text-xs text-muted-foreground/50 lg:text-sm">
                <p>Maximum of 3 addresses reached</p>
                <p>Edit an existing address to make changes</p>
              </div>
            )}
          </div>
        </div>

        <AddressInfo />
      </div>
    </div>
  )
}

export default AddressPage
