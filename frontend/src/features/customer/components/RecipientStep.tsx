import FieldStateError from "@/components/common/FieldStateError"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller } from "react-hook-form"
import type { AddressInput } from "../types/address"
import { useFormContext } from "react-hook-form"

function RecipientStep() {
  const { register, control } = useFormContext<AddressInput>()

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
          minLength: {
            value: 11,
            message: "Phone number must be 11 digits",
          },
          pattern: {
            value: /^(\+63|0)[0-9]{10}$/,
            message: "Invalid Philippine phone number format",
          },
        }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Phone No.</FieldLabel>

            <Input
              {...field}
              placeholder="e.g. 09991234567"
              className="text-xs lg:text-sm"
              maxLength={11}
            />

            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />
    </div>
  )
}

export default RecipientStep
