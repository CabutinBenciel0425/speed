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

import riderScooterImage from "../../../assets/rider-scooter.png"
import chickenImage from "../../../assets/chicken.png"
import burgerImage from "../../../assets/burger.png"
import milkteaImage from "../../../assets/milktea.png"
import RegisterForm from "../components/RegisterForm"
import type { SignupInput } from "../types/auth"
import { signupSchema } from "../schemas/authSchema"
import { motion } from "framer-motion"
import { useRegister } from "../hooks/useRegister"

export function RegisterPage() {
  const { mutate, isPending, error } = useRegister()
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
  })

  function onSubmit(data: SignupInput) {
    mutate(data)

    if (!error) {
      form.reset()
    }
  }

  return (
    <div className="relative flex min-w-full flex-row items-center justify-around">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="w-full px-6 pt-5">
          <CardHeader>
            <CardTitle className="text-2xl">Register an account</CardTitle>
            <CardDescription>Let's get you started with Speed</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm handleSubmitFn={onSubmit} form={form} />
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
              <Button
                type="submit"
                form="form-register"
                className="w-1/2"
                disabled={isPending}
              >
                {isPending ? "Registering..." : "Submit"}
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
      <motion.img
        src={riderScooterImage}
        alt="rider"
        className="hidden 2xl:block 2xl:max-w-4xl"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      />
      <motion.img
        src={chickenImage}
        alt="chicken"
        className="absolute right-20 bottom-25 hidden 2xl:block 2xl:max-w-3xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 120,
          damping: 15,
        }}
      />
      <motion.img
        src={burgerImage}
        alt="burger"
        className="absolute top-5 right-0 hidden 2xl:block 2xl:max-w-2xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 120,
          damping: 15,
          delay: 0.3,
        }}
      />
      <motion.img
        src={milkteaImage}
        alt="milktea"
        className="absolute top-20 right-180 hidden 2xl:block 2xl:max-w-3xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 120,
          damping: 15,
          delay: 0.6,
        }}
      />
    </div>
  )
}

export default RegisterPage
