import { isAxiosError } from "axios"

type ApiError = {
  message?: string
  errors?: Array<{ field?: string; message?: string }>
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<ApiError>(error)) return fallback

  const fieldErrors = error.response?.data?.errors
    ?.map(({ field, message }) =>
      message ? (field ? `${field}: ${message}` : message) : undefined
    )
    .filter(Boolean)

  return fieldErrors?.length
    ? fieldErrors.slice(0, 3).join("; ")
    : (error.response?.data?.message ?? fallback)
}
