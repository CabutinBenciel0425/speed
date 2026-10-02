import type { Address, AddressLabel } from "@/types/address"
import type { AddressFormValues } from "../types/address"
import AddressTypeLocked from "./AddressTypeLocked"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup } from "@/components/ui/radio-group"
import LabelWithRadio from "./LabelWithRadio"
import { ADDRESS_LABELS } from "../utils/constants"
import { Controller, useFormContext } from "react-hook-form"

function AddressLabelStep({
  addresses,
  addressValues,
}: {
  addresses: Address[]
  addressValues?: Address
}) {
  const { control } = useFormContext<AddressFormValues>()

  const isEditing = Boolean(addressValues)

  const registeredLabel = (label: AddressLabel) => {
    return addresses.some((address) => address.label === label)
  }

  if (isEditing && addressValues?.label) {
    return <AddressTypeLocked label={addressValues.label} />
  }

  return (
    <Controller
      name="label"
      control={control}
      rules={{
        required: "Address type is required",
      }}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>Address Type</FieldLabel>

          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="my-10 flex flex-wrap items-center justify-center gap-3"
          >
            {ADDRESS_LABELS.map((label) => (
              <LabelWithRadio
                key={label}
                type={label}
                onRegisteredLabel={registeredLabel}
              />
            ))}
          </RadioGroup>

          {fieldState.invalid && (
            <p className="text-sm text-destructive">
              {fieldState.error?.message}
            </p>
          )}
        </Field>
      )}
    />
  )
}

export default AddressLabelStep
