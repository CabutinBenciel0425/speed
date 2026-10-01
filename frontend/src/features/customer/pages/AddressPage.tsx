import { MapPin } from "lucide-react"
import { useAddressStore } from "@/store/addressStore"
import AddressCard from "../components/AddressCard"
import { useToggleDefaultAddress } from "@/hooks/useToggleDefaultAddress"
import type { Address, AddressLabel } from "@/types/address"
import AddressInfo from "../components/AddressInfo"
import type React from "react"
import AddAddressForm from "../components/AddAddressForm"
import { useState } from "react"

function AddressPage() {
  const { addresses } = useAddressStore()
  const { mutate: toggleDefault } = useToggleDefaultAddress()
  const [addressToEdit, setAddressToEdit] = useState<Address | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddressChange = (
    e: React.MouseEvent<HTMLDivElement>,
    label: AddressLabel
  ) => {
    e.stopPropagation()

    const defaultAddress = addresses.filter((address) => address.isDefault)
    if (defaultAddress[0].label === label) {
      return
    }
    toggleDefault(label)
  }

  const handleAddressEdit = (values: Address) => {
    setAddressToEdit(values)
    setIsModalOpen(true)
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
                key={address._id}
                address={address}
                onHandleAddressChange={handleAddressChange}
                onHandleAddressEdit={handleAddressEdit}
              />
            ))}
          </div>
          <div className="mt-10 flex w-full min-w-0 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/50 bg-muted-foreground/10 px-10 py-3 lg:flex-1">
            <AddAddressForm
              key={addressToEdit?.label ?? "new"}
              addresses={addresses}
              addressValues={addressToEdit}
              open={isModalOpen}
              onOpenChange={(value) => {
                setIsModalOpen(value)
                if (!value) setAddressToEdit(undefined)
              }}
            />
            {addresses.length === 3 && (
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
