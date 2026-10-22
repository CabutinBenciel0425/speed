import { useEffect, useState, type FormEvent } from "react"
import { Bike, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useDriverProfile,
  useUpdateDriverProfile,
} from "../hooks/useDriverData"

export default function DriverProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useDriverProfile()
  const updateProfile = useUpdateDriverProfile()
  const [vehicleType, setVehicleType] = useState<"Motorcycle" | "Bicycle">(
    "Motorcycle"
  )
  const [plateNumber, setPlateNumber] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  useEffect(() => {
    if (!profile) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVehicleType(profile.vehicleType)
    setPlateNumber(profile.plateNumber ?? "")
  }, [profile])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = new FormData()
    payload.set("vehicleType", vehicleType)
    if (vehicleType === "Motorcycle")
      payload.set("plateNumber", plateNumber.trim().toUpperCase())
    if (avatar) payload.set("avatar", avatar)
    updateProfile.mutate(payload)
  }

  if (isLoading)
    return (
      <main className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">
        Loading your profile…
      </main>
    )
  if (isError || !profile)
    return (
      <main className="mx-auto max-w-3xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load your profile.
        </p>
        <button
          className="mt-2 text-sm text-primary underline"
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </main>
    )

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-8">
      <header>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Driver profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your contact details and vehicle information.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" />
            Personal details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">
              {profile.user?.firstName} {profile.user?.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium break-all">{profile.user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">
              {profile.user?.phoneNumber || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account status</p>
            <p className="font-medium">{profile.status}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="size-5 text-primary" />
            Vehicle details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2 text-sm">
              Vehicle type
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3"
                value={vehicleType}
                onChange={(event) =>
                  setVehicleType(event.target.value as typeof vehicleType)
                }
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
              New profile photo (optional)
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button disabled={updateProfile.isPending} type="submit">
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
