import { useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { Loader2 } from "lucide-react"
import type { AddressInput } from "../types/address"
import { Field, FieldLabel } from "@/components/ui/field"
import MapComponent from "./MapComponent"

function LocationStep({ active }: { active: boolean }) {
  const { control } = useFormContext<AddressInput>()

  const { field, fieldState } = useController({
    name: "location",
    control,
    rules: {
      validate: (value) =>
        value?.coordinates ? true : "Please select your location",
    },
  })

  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const handleGetCurrentLocation = () => {
    setLocationStatus("loading")

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        field.onChange({
          type: "Point",
          coordinates: [coords.longitude, coords.latitude],
        })

        setLocationStatus("success")
      },
      (error) => {
        console.error(error)
        setLocationStatus("error")
      }
    )
  }

  const handleMapLocationChange = (position: [number, number]) => {
    const [lat, lng] = position
    field.onChange({
      type: "Point",
      coordinates: [lng, lat],
    })

    setLocationStatus("success")
  }

  const leafletPosition: [number, number] | null = field.value?.coordinates
    ? [field.value.coordinates[1], field.value.coordinates[0]]
    : null

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col">
          <h3 className="text-sm text-muted-foreground lg:text-base">
            Pin your location
          </h3>

          <p className="text-xs text-muted-foreground lg:text-sm">
            Allow Speed to access your current location so we can place the map
            near you.
          </p>
        </div>

        <button
          type="button"
          disabled={locationStatus === "loading"}
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locationStatus === "loading" && (
            <Loader2 className="size-4 animate-spin" />
          )}

          {locationStatus === "loading"
            ? "Finding your location..."
            : locationStatus === "success"
              ? "Location Found"
              : "Use My Current Location"}
        </button>
      </div>

      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Current Location</FieldLabel>

        <MapComponent
          position={leafletPosition}
          onLocationChange={handleMapLocationChange}
          active={active}
        />

        {fieldState.invalid && (
          <p className="text-sm text-destructive">
            {fieldState.error?.message}
          </p>
        )}
      </Field>
    </div>
  )
}

export default LocationStep
