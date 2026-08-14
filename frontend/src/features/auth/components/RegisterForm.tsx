import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, type UseFormReturn } from "react-hook-form"
import type { HandleSubmitRegisterType, SignupInput } from "../types/auth"
import { motion } from "framer-motion"
import FieldStateError from "@/components/common/FieldStateError"

interface RegisterFormProps {
  handleSubmitFn: HandleSubmitRegisterType
  form: UseFormReturn<SignupInput>
}

function RegisterForm({ handleSubmitFn, form }: RegisterFormProps) {
  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      id="form-register"
      className="py-5"
      onSubmit={form.handleSubmit(handleSubmitFn)}
    >
      <FieldGroup>
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div>
                <FieldLabel htmlFor="form-register-firstName">
                  First name:
                </FieldLabel>
              </div>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="John"
                autoComplete="off"
              />
              <FieldStateError fieldState={fieldState} />
            </Field>
          )}
        />
        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-register-lastName">
                Last name:
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Doe"
                autoComplete="off"
              />
              <FieldStateError fieldState={fieldState} />
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-register-email">Email:</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="johndoe@example.com"
                autoComplete="off"
              />
              <FieldStateError fieldState={fieldState} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-register-password">
                Password:
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder=""
                autoComplete="off"
                type="password"
              />
              <FieldStateError fieldState={fieldState} />
            </Field>
          )}
        />

        <Controller
          name="phoneNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-register-phoneNumber">
                Phone number:
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder=""
                autoComplete="off"
              />
              <FieldStateError fieldState={fieldState} />
            </Field>
          )}
        />
      </FieldGroup>
    </motion.form>
  )
}

export default RegisterForm
