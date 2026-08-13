import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, type UseFormReturn } from "react-hook-form"
import type { HandleSubmitLoginType, LoginInput } from "../types/auth"
import { motion } from "framer-motion"

interface LoginFormProps {
  handleSubmitFn: HandleSubmitLoginType
  form: UseFormReturn<LoginInput>
}

function LoginForm({ handleSubmitFn, form }: LoginFormProps) {
  return (
    <motion.form
      id="form-login"
      className="py-5"
      onSubmit={form.handleSubmit(handleSubmitFn)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-login-email">Email:</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="johndoe@example.com"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-login-password">Password:</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder=""
                autoComplete="off"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </motion.form>
  )
}

export default LoginForm
