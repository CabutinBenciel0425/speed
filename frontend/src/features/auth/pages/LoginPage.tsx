import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"

import riderStandingImage from "../../../assets/rider-standing.png"
import type { LoginInput } from "../types/auth"
import { loginSchema } from "../schemas/authSchema"
import { motion } from "framer-motion"
import LoginForm from "../components/LoginForm"
import { useLogin } from "../hooks/useLogin"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function LoginPage() {
  const navigate = useNavigate()
  const { mutate, data, isPending, error } = useLogin()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: LoginInput) {
    mutate(data)

    if (!error) {
      form.reset()
    }
  }

  useEffect(() => {
    if (data) {
      if (data.requiresRoleSelection) {
        navigate("/select-role", { state: { roles: data.roles } })
      } else {
        navigate("/")
      }
    }
  }, [data, navigate])

  return (
    <div className="relative flex min-w-full flex-row items-center justify-center gap-20">
      <div>
        <motion.img
          src={riderStandingImage}
          alt="rider"
          className="hidden 2xl:block 2xl:max-w-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-4 border-accent px-6 pt-5 shadow-lg shadow-accent">
          <CardHeader>
            <CardTitle className="text-2xl">Login your account</CardTitle>
            <CardDescription>It's great having you back!</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm handleSubmitFn={onSubmit} form={form} />
          </CardContent>
          <CardFooter className="mb-2 flex flex-col">
            <Field
              orientation="horizontal"
              className="flex items-center justify-around"
            >
              <Button
                type="button"
                className="w-1/2"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit" form="form-login" className="w-1/2">
                {isPending ? "Logging..." : "Submit"}
              </Button>
            </Field>
            {error && (
              <p className="mt-5 block text-center text-red-500">
                {error.message}
              </p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage
