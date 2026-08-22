import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useAuth } from "@/hooks/useAuth"
import { NavLink, useNavigate } from "react-router-dom"
import { useVerifyCode } from "../hooks/useVerifyCode"
import type { VerificationCodeInput } from "../types/emailVerification"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

function InputCodeCard() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState("")
  const { user } = useAuth()
  const { mutate, isPending, error } = useVerifyCode()

  const handleSubmit = (data: VerificationCodeInput) => {
    if (!data.email) {
      toast.error("User email not found")
    }
    mutate(data)
    console.log(data)
  }

  useEffect(() => {
    if (user?.isVerified) {
      navigate("/")
    }
  }, [user?.isVerified, navigate])

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-8 px-3 py-5">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle className="text-lg">Verify your email</CardTitle>
        <CardDescription>
          Enter the verification code we sent to your email address:{" "}
          <span className="text-md font-semibold text-primary">
            {user?.email}
          </span>
          .
        </CardDescription>
      </CardHeader>
      <form
        action={() => handleSubmit({ email: user?.email ?? "", code: otp })}
      >
        <CardContent className="w-full">
          <Field className="px-5">
            <div className="mb-2 flex w-full items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button variant="outline" size="xs">
                <RefreshCwIcon />
                Resend Code
              </Button>
            </div>
            <div className="mb-4 flex w-full items-center justify-center">
              <InputOTP
                maxLength={6}
                id="otp-verification"
                required
                className="mx-auto w-full"
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldDescription className="flex w-full items-center justify-center">
              <NavLink to="#" className={"text-xs"}>
                <span>I no longer have access to this email address.</span>
              </NavLink>
            </FieldDescription>
          </Field>
        </CardContent>
        <CardFooter>
          <Field>
            <Button type="submit" className="w-full">
              {!isPending ? (
                "Verify"
              ) : (
                <>
                  <Spinner className="mr-2" />
                  <span>Verifying</span>
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-destructive">
                {error.message || "Something went wrong"}
              </p>
            )}
          </Field>
        </CardFooter>
      </form>
    </Card>
  )
}

export default InputCodeCard
