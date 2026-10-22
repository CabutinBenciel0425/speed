import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { emailVerifySchema } from "@/features/auth/schemas/authSchema"
import type { VerifyEmailInput } from "@/features/auth/types/auth"
import { useAuth } from "@/hooks/useAuth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Controller } from "react-hook-form"
import { NavLink, useNavigate } from "react-router-dom"
import { useVerifyEmail } from "../hooks/useVerifyEmail"
import { Spinner } from "@/components/ui/spinner"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import FieldStateError from "@/components/common/FieldStateError"
import { Field, FieldLabel } from "@/components/ui/field"

function EmailVerificationCard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { mutate, data, isPending, error } = useVerifyEmail()
  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(emailVerifySchema),
    defaultValues: {
      email: user?.email ?? "",
    },
  })

  const handleSubmit = (data: VerifyEmailInput) => {
    mutate(data)
  }

  useEffect(() => {
    if (data?.success) {
      navigate("/input-otp", { state: { email: form.getValues("email") } })
    }
  }, [data, form, navigate])

  useEffect(() => {
    if (user?.email) form.setValue("email", user.email)
  }, [form, user?.email])

  return (
    <Card
      size="default"
      className="mx-auto max-w-md min-w-100 px-2 py-4 md:min-w-md"
    >
      <CardHeader>
        <CardTitle className="mb-3">Email Verification</CardTitle>
        <CardDescription>
          Verify your email so you can access all Speed's features
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="verification-email">
                  Email address
                </FieldLabel>
                <Input
                  {...field}
                  id="verification-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  readOnly={Boolean(user?.email)}
                  aria-invalid={fieldState.invalid}
                />
                <FieldStateError fieldState={fieldState} />
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            size="sm"
            className="w-full"
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-1" />
                <span>Sending code</span>
              </>
            ) : (
              "Verify Email address"
            )}
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <NavLink to="/">Not now</NavLink>
          </Button>

          {error && (
            <p className="text-sm text-destructive">
              {
                "The verification email could not be sent. Check the address and try again."
              }
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

export default EmailVerificationCard
