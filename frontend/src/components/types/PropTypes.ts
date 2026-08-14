import type { FieldError } from "react-hook-form"

export type FieldStateType = {
  invalid: boolean
  isTouched: boolean
  isDirty: boolean
  isValidating: boolean
  error?: FieldError
}
