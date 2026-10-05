import type { Address } from "@/types/address"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormProvider, useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import AddressModalSteps from "./AddressModalSteps"
import type { AddressInput } from "../types/address"
import { getDefaultAddressValues } from "../utils/addressForm"
import { useAddNewAddress } from "../hooks/useAddNewAddress"
import { useUpdateAddress } from "../hooks/useUpdateAddress"

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
  const { mutate: addNewAddress, isPending: addingNewAddress } =
    useAddNewAddress()
  const { mutate: updateAddress, isPending: updatingAddress } =
    useUpdateAddress()
  const form = useForm<AddressInput>({
    defaultValues: getDefaultAddressValues(addressValues),
  })

  const { handleSubmit, reset } = form

  const isEditing = Boolean(addressValues)

  const onSubmit = (data: AddressInput) => {
    if (isEditing && addressValues) {
      updateAddress(data, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }

    addNewAddress(data, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  useEffect(() => {
    if (!open) reset(getDefaultAddressValues(addressValues))
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

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)]! max-w-3xl! min-w-90 overflow-x-hidden overflow-y-auto transition duration-300 ease-in-out lg:px-5 lg:py-10">
        <FormProvider {...form}>
          <form
            id="form-address"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="w-full min-w-0"
          >
            <h2 className="text-base font-semibold text-primary lg:text-lg">
              {isEditing ? "Edit Address" : "Add New Address"}
            </h2>

            <AddressModalSteps
              addresses={addresses}
              addressValues={addressValues}
              isEditing={isEditing}
              addingNewAddress={addingNewAddress}
              updatingAddress={updatingAddress}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressForm
