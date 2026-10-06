import { useState, type FormEvent } from "react"
import { Navigate, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useCreateProviderProfile } from "../hooks/useCreateProviderProfile"

function DriverSignupPage() {
  const { isAuthenticated, isVerified } = useAuth()
  const createDriver = useCreateProviderProfile("driver")
  const [vehicleType, setVehicleType] = useState("Motorcycle")
  const [plateNumber, setPlateNumber] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = new FormData()
    payload.set("vehicleType", vehicleType)
    if (vehicleType === "Motorcycle") payload.set("plateNumber", plateNumber)
    if (avatar) payload.set("avatar", avatar)
    createDriver.mutate(payload)
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-8">
      <Button render={<NavLink to="/" />} variant="ghost" className="mb-4">
        ← Back to Speed
      </Button>
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        Register as a driver
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell us about your vehicle to start delivering with Speed.
      </p>
      {!isVerified ? (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          Verify your email before registering as a driver.{" "}
          <NavLink className="text-primary underline" to="/verify-email">
            Verify email
          </NavLink>
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-lg border p-4 sm:p-6"
        >
          <label className="block space-y-2 text-sm">
            Vehicle type
            <select
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3"
            >
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
            </select>
          </label>
          {vehicleType === "Motorcycle" && (
            <label className="block space-y-2 text-sm">
              Plate number
              <Input
                required
                minLength={6}
                maxLength={8}
                value={plateNumber}
                onChange={(event) =>
                  setPlateNumber(event.target.value.toUpperCase())
                }
              />
            </label>
          )}
          <label className="block space-y-2 text-sm">
            Profile photo (optional)
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
            />
          </label>
          <Button type="submit" disabled={createDriver.isPending}>
            {createDriver.isPending
              ? "Creating account…"
              : "Create driver account"}
          </Button>
        </form>
      )}
    </main>
  )
}

export default DriverSignupPage
