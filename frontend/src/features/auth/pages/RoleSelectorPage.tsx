import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import RoleSelector from "../components/RoleSelector"
import { useForm } from "react-hook-form"
import type { ValidUserRoleInput } from "../types/auth"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelectRole } from "../hooks/useSelectRole"
import { motion } from "framer-motion"
import { getRoleHomePath } from "@/utils/roleRoutes"

export type RoleFormValues = {
  role: ValidUserRoleInput
}

function RoleSelectorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const roles = location.state?.roles || []

  const { mutate, isPending } = useSelectRole()

  const form = useForm<RoleFormValues>({
    defaultValues: {
      role: roles.length > 0 ? roles[0] : "",
    },
  })

  const onSubmit = (data: RoleFormValues) => {
    if (!data.role) return
    mutate(data.role, {
      onSuccess: () => navigate(getRoleHomePath(data.role)),
    })
  }

  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <Card className="w-full max-w-xl border-4 border-accent px-6 pt-5 shadow-lg shadow-accent">
        <CardHeader>
          <CardTitle className="text-2xl">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleSelector control={form.control} roles={roles} />
        </CardContent>
        <CardFooter className="mb-2">
          <Field
            orientation="horizontal"
            className="flex items-center justify-around"
          >
            <Button type="submit" className="w-full" disabled={isPending}>
              Continue
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </motion.form>
  )
}

export default RoleSelectorPage
