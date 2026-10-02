import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { AddressInput } from "../types/address"
import { Controller, useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import FieldStateError from "@/components/common/FieldStateError"

function AddressOptionalDetails() {
  const { register, control } = useFormContext<AddressInput>()

  return (
    <div className="flex flex-col gap-5">
      <Field>
        <FieldLabel>
          Landmark
          <span className="text-muted-foreground/70"> (optional)</span>
        </FieldLabel>

        <Input
          {...register("landmark")}
          placeholder="e.g. Near Apollo Hospital"
          className="text-xs lg:text-sm"
        />
      </Field>

      <Field>
        <FieldLabel>
          Instructions
          <span className="text-muted-foreground/70"> (optional)</span>
        </FieldLabel>

        <Input
          {...register("instructions")}
          placeholder="e.g. Just leave the food at the lobby"
          className="text-xs lg:text-sm"
        />
      </Field>

      <Controller
        name="isDefault"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <div className="mb-3 flex flex-row items-center justify-start gap-2">
              <Checkbox
                id="isDefault"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
              <FieldLabel className="mt-0.5" htmlFor="isDefault">
                Make this as your default delivery address
              </FieldLabel>
            </div>

            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />
    </div>
  )
}

export default AddressOptionalDetails
