import type { Address } from "@/types/address"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormProvider, useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import AddressModalCarousel from "./AddressModalCarousel"
import type { AddressFormValues } from "../types/address"
import { getDefaultAddressValues } from "../utils/addressForm"

function AddAddressForm({
  addresses,
  addressValues,
  open,
  onOpenChange,
}: {
  addresses: Address[]
  addressValues?: Address
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const form = useForm<AddressFormValues>({
    defaultValues: getDefaultAddressValues(addressValues),
  })

  const { handleSubmit, reset } = form

  const isEditing = Boolean(addressValues)

  const onSubmit = (data: AddressFormValues) => {
    console.log(data)
    // create/update mutation here later
  }

  useEffect(() => {
    if (!open) return

    reset(getDefaultAddressValues(addressValues))
  }, [open, addressValues, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button disabled={addresses.length === 3} variant="ghost">
            <Plus />
            Add New Address
          </Button>
        }
      />

      <DialogContent className="w-[calc(100vw-2rem)]! max-w-3xl! min-w-90 lg:px-5 lg:py-10">
        <FormProvider {...form}>
          <form
            id="form-address"
            onSubmit={handleSubmit(onSubmit)}
            className="w-full min-w-0"
          >
            <h2 className="text-base font-semibold text-primary lg:text-lg">
              {isEditing ? "Edit Address" : "Add New Address"}
            </h2>

            <AddressModalCarousel
              addresses={addresses}
              addressValues={addressValues}
              isEditing={isEditing}
              open={open}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressForm
