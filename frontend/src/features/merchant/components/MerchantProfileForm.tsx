import { useEffect, useState, type FormEvent } from "react"
import { MapPin, LoaderCircle } from "lucide-react"
import type { Merchant } from "@/features/customer/types/merchant"
import MapComponent from "@/features/customer/components/MapComponent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

type Day = (typeof days)[number]
type DayForm = { isOpen: boolean; openTime: string; closeTime: string }
type FormState = {
  merchantName: string
  description: string
  phoneNumber: string
  minimumOrder: string
  address: { street: string; barangay: string; city: string; province: string }
  location: [number, number] | null
  operatingHours: Record<Day, DayForm>
  logo: File | null
  banner: File | null
}

const defaultHours = (): Record<Day, DayForm> =>
  Object.fromEntries(
    days.map((day) => [
      day,
      { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    ])
  ) as Record<Day, DayForm>

const formatTime = (hour?: number, minute?: number) =>
  `${String(hour ?? 9).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")}`

function getInitialForm(merchant?: Merchant | null): FormState {
  const coordinates = merchant?.address?.location?.coordinates
  const operatingHours = defaultHours()
  for (const day of days) {
    const hours = merchant?.operatingHours?.[day]
    if (hours) {
      operatingHours[day] = {
        isOpen: hours.isOpen,
        openTime: formatTime(hours.openHour, hours.openMinute),
        closeTime: formatTime(hours.closeHour, hours.closeMinute),
      }
    }
  }

  return {
    merchantName: merchant?.merchantName ?? "",
    description: merchant?.description ?? "",
    phoneNumber: merchant?.phoneNumber ?? "",
    minimumOrder: String(merchant?.minimumOrder ?? 1),
    address: {
      street: merchant?.address?.street ?? "",
      barangay: merchant?.address?.barangay ?? "",
      city: merchant?.address?.city ?? "",
      province: merchant?.address?.province ?? "",
    },
    location:
      coordinates?.length === 2 &&
      (coordinates[0] !== 0 || coordinates[1] !== 0)
        ? [coordinates[1], coordinates[0]]
        : null,
    operatingHours,
    logo: null,
    banner: null,
  }
}

const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number)
  return { hour, minute }
}

function MerchantProfileForm({
  merchant,
  isSaving,
  onSave,
  submitLabel = "Save changes",
  requireLogo = false,
}: {
  merchant?: Merchant | null
  isSaving: boolean
  onSave: (payload: FormData) => void
  submitLabel?: string
  requireLogo?: boolean
}) {
  const [form, setForm] = useState(() => getInitialForm(merchant))
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(getInitialForm(merchant))
  }, [merchant])

  const updateHours = (day: Day, patch: Partial<DayForm>) =>
    setForm((current) => ({
      ...current,
      operatingHours: {
        ...current.operatingHours,
        [day]: { ...current.operatingHours[day], ...patch },
      },
    }))

  const handleLocationChange = (position: [number, number]) => {
    setForm((current) => ({ ...current, location: position }))
  }

  const locateStore = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          location: [coords.latitude, coords.longitude],
        }))
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.location) return

    const operatingHours = Object.fromEntries(
      days.map((day) => {
        const value = form.operatingHours[day]
        const open = toMinutes(value.openTime)
        const close = toMinutes(value.closeTime)
        return [
          day,
          {
            isOpen: value.isOpen,
            openHour: open.hour,
            openMinute: open.minute,
            closeHour: close.hour,
            closeMinute: close.minute,
          },
        ]
      })
    )
    const payload = new FormData()
    payload.set("merchantName", form.merchantName.trim())
    payload.set("description", form.description.trim())
    payload.set("phoneNumber", form.phoneNumber.trim())
    payload.set("minimumOrder", form.minimumOrder)
    payload.set(
      "address",
      JSON.stringify({
        ...form.address,
        location: {
          type: "Point",
          coordinates: [form.location[1], form.location[0]],
        },
      })
    )
    payload.set("operatingHours", JSON.stringify(operatingHours))
    if (form.logo) payload.set("logo", form.logo)
    if (form.banner) payload.set("banner", form.banner)
    onSave(payload)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="space-y-4 rounded-lg border p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Store information</h2>
          <p className="text-sm text-muted-foreground">
            Update the details customers see on your store page.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            Store name
            <Input
              required
              minLength={2}
              value={form.merchantName}
              onChange={(e) =>
                setForm({ ...form, merchantName: e.target.value })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            Phone number
            <Input
              required
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              placeholder="09XXXXXXXXX"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            Description
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            Minimum order (₱)
            <Input
              required
              type="number"
              min="1"
              step="0.01"
              value={form.minimumOrder}
              onChange={(e) =>
                setForm({ ...form, minimumOrder: e.target.value })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            Store logo
            <Input
              required={requireLogo && !merchant?.logo}
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, logo: e.target.files?.[0] ?? null })
              }
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            Store banner
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, banner: e.target.files?.[0] ?? null })
              }
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Store address and location</h2>
          <p className="text-sm text-muted-foreground">
            Choose the store pin on the map so delivery distance is calculated
            correctly.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["street", "barangay", "city", "province"] as const).map((key) => (
            <label key={key} className="space-y-2 text-sm">
              {key[0].toUpperCase() + key.slice(1)}
              <Input
                required
                value={form.address[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: { ...form.address, [key]: e.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={locateStore}
          disabled={locating}
        >
          {locating ? <LoaderCircle className="animate-spin" /> : <MapPin />}
          Use current location
        </Button>
        <MapComponent
          position={form.location}
          onLocationChange={handleLocationChange}
          active
        />
        {!form.location && (
          <p className="text-sm text-destructive">
            Select your store location on the map.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-lg border p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Operating hours</h2>
          <p className="text-sm text-muted-foreground">
            Set opening and closing times for each day.
          </p>
        </div>
        <div className="space-y-3">
          {days.map((day) => {
            const hours = form.operatingHours[day]
            return (
              <div
                key={day}
                className="grid items-center gap-3 border-b pb-3 last:border-0 sm:grid-cols-[8rem_6rem_1fr_1fr]"
              >
                <span className="text-sm font-medium">{day}</span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) =>
                      updateHours(day, { isOpen: e.target.checked })
                    }
                  />
                  Open
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Opens
                  <Input
                    type="time"
                    required={hours.isOpen}
                    disabled={!hours.isOpen}
                    value={hours.openTime}
                    onChange={(e) =>
                      updateHours(day, { openTime: e.target.value })
                    }
                  />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Closes
                  <Input
                    type="time"
                    required={hours.isOpen}
                    disabled={!hours.isOpen}
                    value={hours.closeTime}
                    onChange={(e) =>
                      updateHours(day, { closeTime: e.target.value })
                    }
                  />
                </label>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || !form.location}>
          {isSaving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default MerchantProfileForm
