import { Controller, type Control } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import type { RoleFormValues } from "../pages/RoleSelectorPage"

type RoleSelectorProps = {
  control: Control<RoleFormValues>
  roles: string[]
}

function RoleSelector({ control, roles }: RoleSelectorProps) {
  return (
    <FieldGroup>
      <Controller
        name="role"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Label className="mb-5">Select your role:</Label>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-row gap-8"
            >
              {roles.map((role) => (
                <div key={role} className="flex flex-row gap-2">
                  <RadioGroupItem value={role} id={role} className={"mt-1"} />
                  <Label htmlFor={role} className="text-lg">
                    {role}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  )
}

export default RoleSelector
