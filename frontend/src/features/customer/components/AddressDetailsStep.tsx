import FieldStateError from "@/components/common/FieldStateError"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller } from "react-hook-form"
import type { AddressInput } from "../types/address"
import { useFormContext } from "react-hook-form"
import { useState } from "react"
import type {
  PSGCBarangay,
  PSGCCitiesMunicipality,
  PSGCProvince,
  PSGCRegion,
} from "@/services/psgcService"
import {
  useBarangays,
  useCitiesMunicipalities,
  useProvincesByRegion,
  useRegions,
} from "../hooks/usePsgcData"

function LocationLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <p
      className="mt-1 flex items-center gap-2 text-xs text-destructive"
      role="alert"
    >
      Could not load locations.{" "}
      <button type="button" className="underline" onClick={onRetry}>
        Retry
      </button>
    </p>
  )
}

function AddressDetailsStep() {
  const { control, setValue } = useFormContext<AddressInput>()

  const [selectedRegion, setSelectedRegion] = useState<PSGCRegion | null>(null)

  const [selectedProvince, setSelectedProvince] = useState<PSGCProvince | null>(
    null
  )

  const [selectedCity, setSelectedCity] =
    useState<PSGCCitiesMunicipality | null>(null)

  const [selectedBarangay, setSelectedBarangay] = useState<PSGCBarangay | null>(
    null
  )

  const regionsQuery = useRegions()
  const { data: regions = [] } = regionsQuery

  const provincesQuery = useProvincesByRegion(
    selectedRegion?.psgc10DigitCode ?? ""
  )
  const { data: provinces = [] } = provincesQuery

  const regionHasProvinces = Boolean(selectedRegion) && provinces.length > 0

  const citiesQuery = useCitiesMunicipalities({
    regionPsgc10: selectedRegion?.psgc10DigitCode,
    provincePsgc10: selectedProvince?.psgc10DigitCode,
  })
  const { data: citiesMunicipalities = [] } = citiesQuery

  const barangaysQuery = useBarangays(selectedCity?.psgc10DigitCode ?? "")
  const { data: barangays = [] } = barangaysQuery

  const handleRegionChange = (region: PSGCRegion | null) => {
    setSelectedRegion(region)
    setSelectedProvince(null)
    setSelectedCity(null)
    setSelectedBarangay(null)

    setValue("province", "")
    setValue("city", "")
    setValue("barangay", "")
  }

  const handleProvinceChange = (province: PSGCProvince | null) => {
    setSelectedProvince(province)
    setSelectedCity(null)
    setSelectedBarangay(null)

    setValue("city", "")
    setValue("barangay", "")
  }

  const handleCityChange = (city: PSGCCitiesMunicipality | null) => {
    setSelectedCity(city)
    setSelectedBarangay(null)

    setValue("barangay", "")
  }

  const handleBarangayChange = (barangay: PSGCBarangay | null) => {
    setSelectedBarangay(barangay)
  }

  const cityDisabled = regionHasProvinces ? !selectedProvince : !selectedRegion
  const cityPlaceholder = !selectedRegion
    ? "Select a region first"
    : citiesQuery.isLoading
      ? "Loading cities / municipalities…"
      : citiesQuery.isError
        ? "Cities / municipalities unavailable"
        : regionHasProvinces && !selectedProvince
          ? "Select a province first"
          : "Select your City / Municipality"
  return (
    <>
      <Controller
        name="houseOrUnitNumber"
        control={control}
        rules={{
          required: "House / Unit No. is required",
        }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>House / Unit No.</FieldLabel>

            <Input {...field} placeholder="e.g. 123" />

            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />

      <Controller
        name="street"
        control={control}
        rules={{
          required: "Street is required",
        }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Street</FieldLabel>

            <Input {...field} placeholder="e.g. Sunshine St." />

            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="region"
        rules={{ required: "Region is required" }}
        render={({ field, fieldState }) => (
          <Field className="w-full" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="region" className="text-xs lg:text-sm">
              Region <span className="text-destructive">*</span>
            </FieldLabel>
            <Combobox
              items={regions}
              value={selectedRegion}
              onValueChange={(item) => {
                handleRegionChange(item)
                field.onChange(item?.name ?? "")
              }}
              itemToStringLabel={(item) => item.name}
              data-invalid={fieldState.invalid}
            >
              <ComboboxInput
                placeholder={
                  regionsQuery.isLoading
                    ? "Loading regions…"
                    : regionsQuery.isError
                      ? "Regions unavailable"
                      : "Select your region"
                }
                className="w-full rounded-sm text-xs lg:text-sm"
              />
              <ComboboxContent className="rounded-sm">
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.psgc10DigitCode} value={item}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {regionsQuery.isError && (
              <LocationLoadError onRetry={() => void regionsQuery.refetch()} />
            )}
            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />

      {(!selectedRegion || regionHasProvinces) && (
        <Field className="flex-1">
          <FieldLabel htmlFor="province" className="text-xs lg:text-sm">
            Province <span className="text-destructive">*</span>
          </FieldLabel>

          <Controller
            control={control}
            name="province"
            rules={{ required: "Province is required" }}
            render={({ field, fieldState }) => (
              <>
                <Combobox
                  items={provinces}
                  value={selectedProvince}
                  onValueChange={(item) => {
                    field.onChange(item?.name ?? "")
                    handleProvinceChange(item)
                  }}
                  itemToStringLabel={(item) => item.name}
                >
                  <ComboboxInput
                    placeholder={
                      provincesQuery.isLoading
                        ? "Loading provinces…"
                        : provincesQuery.isError
                          ? "Provinces unavailable"
                          : !selectedRegion
                            ? "Select a region first"
                            : "Select your province"
                    }
                    className="w-full rounded-sm text-xs lg:text-sm"
                  />
                  <ComboboxContent className="rounded-sm">
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem
                          key={item.psgc10DigitCode}
                          value={item}
                          className={"text-xs lg:text-sm"}
                        >
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {provincesQuery.isError && (
                  <LocationLoadError
                    onRetry={() => void provincesQuery.refetch()}
                  />
                )}
                <FieldStateError fieldState={fieldState} />
              </>
            )}
          />
        </Field>
      )}

      <Controller
        control={control}
        name="city"
        rules={{
          required: "City or Municipality is required",
        }}
        render={({ field, fieldState }) => (
          <Field className="flex-1">
            <FieldLabel htmlFor="city" className="text-xs lg:text-sm">
              City / Municipality <span className="text-destructive">*</span>
            </FieldLabel>
            <Combobox
              items={citiesMunicipalities}
              value={selectedCity}
              disabled={cityDisabled}
              onValueChange={(item) => {
                field.onChange(item?.name ?? "")
                handleCityChange(item)
              }}
              itemToStringLabel={(item) => item.name}
            >
              <ComboboxInput
                placeholder={cityPlaceholder}
                className="w-full rounded-sm text-xs lg:text-sm"
              />
              <ComboboxContent className="rounded-sm">
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      key={item.psgc10DigitCode}
                      value={item}
                      className={"text-xs lg:text-sm"}
                    >
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {citiesQuery.isError && (
              <LocationLoadError onRetry={() => void citiesQuery.refetch()} />
            )}
            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="barangay"
        rules={{ required: "Barangay is required" }}
        render={({ field, fieldState }) => (
          <Field className="w-full">
            <FieldLabel htmlFor="barangay" className="text-xs lg:text-sm">
              Barangay <span className="text-destructive">*</span>
            </FieldLabel>
            <Combobox
              items={barangays}
              value={selectedBarangay}
              disabled={!selectedCity}
              onValueChange={(item) => {
                field.onChange(item?.name ?? "")
                handleBarangayChange(item)
              }}
              itemToStringLabel={(item) => item.name}
            >
              <ComboboxInput
                placeholder={
                  barangaysQuery.isLoading
                    ? "Loading barangays…"
                    : barangaysQuery.isError
                      ? "Barangays unavailable"
                      : "Select your barangay"
                }
                className="w-full rounded-sm text-xs lg:text-sm"
              />
              <ComboboxContent className="rounded-sm">
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      key={item.psgc10DigitCode}
                      value={item}
                      className={"text-xs lg:text-sm"}
                    >
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {barangaysQuery.isError && (
              <LocationLoadError
                onRetry={() => void barangaysQuery.refetch()}
              />
            )}
            <FieldStateError fieldState={fieldState} />
          </Field>
        )}
      />
    </>
  )
}

export default AddressDetailsStep
