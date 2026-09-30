import FieldStateError from "@/components/common/FieldStateError"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller } from "react-hook-form"
import type { AddressFormValues } from "../types/address"
import { useFormContext } from "react-hook-form"

function RecipientStep() {
  const { register, control } = useFormContext<AddressFormValues>()

  return (
    <div className="flex flex-col gap-5">
      <Field>
        <FieldLabel>
          Recipient Name
          <span className="text-muted-foreground/70"> (optional)</span>
        </FieldLabel>

        <Input
          {...register("recipientName")}
          placeholder="e.g. John Doe"
          className="text-xs lg:text-sm"
        />
      </Field>

      <Controller
        name="phoneNumber"
        control={control}
        rules={{
          required: "Phone number is required",
        }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Phone No.</FieldLabel>

            <Input
              {...field}
              placeholder="e.g. 09991234567"
              className="text-xs lg:text-sm"
            />

            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />
    </div>
  )
}

export default RecipientStep
