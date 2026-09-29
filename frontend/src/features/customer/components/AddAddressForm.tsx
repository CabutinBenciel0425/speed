import { RadioGroup } from "@/components/ui/radio-group"
import type { Address, AddressLabel } from "@/types/address"
import { useEffect, useState } from "react"
import LabelWithRadio from "./LabelWithRadio"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import type {
  PSGCRegion,
  PSGCProvince,
  PSGCCitiesMunicipality,
  PSGCBarangay,
} from "@/services/psgcService"
import {
  useRegions,
  useProvincesByRegion,
  useCitiesMunicipalities,
  useBarangays,
} from "../hooks/usePsgcData"
import { useForm } from "react-hook-form"
import { Controller } from "react-hook-form"
import FieldStateError from "@/components/common/FieldStateError"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import AddressTypeLocked from "./AddressTypeLocked"

export type Labels = ["Home", "Work", "Other"]
interface AddressInput {
  label: string
  houseOrUnitNumber: string
  street: string
  region: string
  province: string
  city: string
  barangay: string
  landmark: string
  recipientName: string
  phoneNumber: string
  isDefault: boolean
}

function AddAddressForm({
  addresses,
  addressValues,
  open,
  onOpenChange,
}: {
  addresses: Address[]
  addressValues?: Address
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const { register, handleSubmit, setValue, reset, control } =
    useForm<AddressInput>({
      defaultValues: {
        label: addressValues?.label || "",
        houseOrUnitNumber: addressValues?.houseOrUnitNumber || "",
        street: addressValues?.street || "",
        region: addressValues?.region || "",
        province: addressValues?.province || "",
        city: addressValues?.city || "",
        barangay: addressValues?.barangay || "",
        landmark: addressValues?.landmark || "",
        recipientName: addressValues?.recipientName || "",
        phoneNumber: addressValues?.phoneNumber || "",
        isDefault: addressValues?.isDefault || false,
      },
    })

  const error = false
  const [labelToAdd, setLabelToAdd] = useState<string | undefined>(
    addressValues?.label ?? undefined
  )

  const labels: Labels = ["Home", "Work", "Other"]

  const [selectedRegion, setSelectedRegion] = useState<PSGCRegion | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<PSGCProvince | null>(
    null
  )
  const [selectedCity, setSelectedCity] =
    useState<PSGCCitiesMunicipality | null>(null)
  const [selectedBarangay, setSelectedBarangay] = useState<PSGCBarangay | null>(
    null
  )

  const { data: regions = [] } = useRegions()

  const { data: provinces = [] } = useProvincesByRegion(
    selectedRegion?.psgc10DigitCode ?? ""
  )

  const regionHasProvinces = !!selectedRegion && provinces.length > 0

  const { data: citiesMunicipalities = [] } = useCitiesMunicipalities({
    regionPsgc10: selectedRegion?.psgc10DigitCode,
    provincePsgc10: selectedProvince?.psgc10DigitCode,
  })

  const { data: barangays = [] } = useBarangays(
    selectedCity?.psgc10DigitCode ?? ""
  )

  const registeredLabel = (value: AddressLabel) => {
    if (!value) return false
    return addresses.some(
      (address: Address) => address.label.toLowerCase() === value.toLowerCase()
    )
  }

  const onLabelValueChanged = (value: string) => {
    if (!value) return
    setLabelToAdd(value)
  }

  const handleRegionChange = (region: PSGCRegion | null) => {
    setSelectedRegion(region)
    setSelectedProvince(null)
    setSelectedCity(null)
    setSelectedBarangay(null)

    setValue("region", region?.name ?? "", { shouldValidate: true })
    setValue("province", "", { shouldValidate: true })
    setValue("city", "", { shouldValidate: true })
    setValue("barangay", "", { shouldValidate: true })
  }

  const handleProvinceChange = (province: PSGCProvince | null) => {
    setSelectedProvince(province)
    setSelectedCity(null)
    setSelectedBarangay(null)

    setValue("province", province?.name ?? "", { shouldValidate: true })
    setValue("city", "", { shouldValidate: true })
    setValue("barangay", "", { shouldValidate: true })
  }

  const handleCityChange = (city: PSGCCitiesMunicipality | null) => {
    setSelectedCity(city)
    setSelectedBarangay(null)

    setValue("city", city?.name ?? "", { shouldValidate: true })
    setValue("barangay", "", { shouldValidate: true })
  }

  const handleBarangayChange = (barangay: PSGCBarangay | null) => {
    setSelectedBarangay(barangay)

    setValue("barangay", barangay?.name ?? "", { shouldValidate: true })
  }

  const cityDisabled = regionHasProvinces ? !selectedProvince : !selectedRegion
  const cityPlaceholder = !selectedRegion
    ? "Select a region first"
    : regionHasProvinces && !selectedProvince
      ? "Select a province first"
      : "Select your City / Municipality"

  const onSubmit = (data: AddressInput) => {
    console.log(data)

    if (error) {
      reset()
    }
  }

  useEffect(() => {
    reset({
      label: addressValues?.label || "",
      houseOrUnitNumber: addressValues?.houseOrUnitNumber || "",
      street: addressValues?.street || "",
      region: addressValues?.region || "",
      province: addressValues?.province || "",
      city: addressValues?.city || "",
      barangay: addressValues?.barangay || "",
      landmark: addressValues?.landmark || "",
      recipientName: addressValues?.recipientName || "",
      phoneNumber: addressValues?.phoneNumber || "",
      isDefault: addressValues?.isDefault || false,
    })
  }, [addressValues, reset])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabelToAdd(addressValues?.label ?? undefined)
  }, [addressValues])

  useEffect(() => {
    if (!addressValues?.province || selectedProvince) return
    const found = provinces.find((p) => p.name === addressValues.province)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (found) setSelectedProvince(found)
  }, [provinces, addressValues, selectedProvince])

  useEffect(() => {
    if (!addressValues?.city || selectedCity) return
    const found = citiesMunicipalities.find(
      (c) => c.name === addressValues.city
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (found) setSelectedCity(found)
  }, [citiesMunicipalities, addressValues, selectedCity])

  useEffect(() => {
    if (!addressValues?.barangay || selectedBarangay) return
    const found = barangays.find((b) => b.name === addressValues.barangay)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (found) setSelectedBarangay(found)
    console.log(found)
  }, [barangays, addressValues, selectedBarangay])

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)
        if (!value) {
          reset()
          setSelectedRegion(null)
          setSelectedProvince(null)
          setSelectedCity(null)
          setSelectedBarangay(null)
          setLabelToAdd(undefined)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant={"ghost"}
            className={`flex cursor-pointer flex-row items-center justify-center text-base hover:bg-transparent ${addresses.length === 3 && "cursor-not-allowed opacity-10"}`}
            disabled={addresses.length === 3}
          >
            <Plus className="size-5" />
            <span className="mt-0.5 text-sm lg:text-base">
              {" "}
              Add New Address
            </span>
          </Button>
        }
      />
      <DialogContent
        className="max-w-[95vw] px-2 py-4 duration-300 sm:max-w-2xl lg:max-w-4xl lg:px-8 lg:py-10 xl:max-w-5xl data-open:zoom-in-100 data-open:slide-in-from-bottom-8 data-closed:zoom-out-100 data-closed:slide-out-to-bottom-8 [[data-slot=dialog-overlay]:has(~_&)]:duration-300"
        showCloseButton={true}
      >
        <div className="flex w-full flex-col">
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="form-address"
            className="mx-auto max-h-150 w-full max-w-sm overflow-y-auto px-3 py-5 sm:max-w-md md:max-w-lg lg:max-w-3xl xl:max-w-5xl"
          >
            <h2 className="text-sm font-semibold text-primary lg:text-base">
              {addressValues?.label ? "Edit Address" : "Add New Address"}
            </h2>

            <FieldGroup className="flex w-full flex-col items-center justify-center py-8 lg:flex-row lg:justify-between">
              <div className="flex w-full flex-col gap-5 lg:w-1/2">
                {addressValues?.label ? (
                  <AddressTypeLocked label={addressValues?.label} />
                ) : (
                  <Field>
                    <FieldLabel htmlFor="label" className="text-xs lg:text-sm">
                      Address Type
                    </FieldLabel>
                    <RadioGroup
                      className="flex flex-row flex-wrap items-center justify-around gap-2 lg:gap-4"
                      onValueChange={onLabelValueChanged}
                      value={labelToAdd}
                      {...register("label", {
                        required: "Address type is required",
                      })}
                    >
                      {labels.map((label) => (
                        <LabelWithRadio
                          key={label}
                          type={label}
                          onRegisteredLabel={registeredLabel}
                        />
                      ))}
                    </RadioGroup>
                  </Field>
                )}

                <Controller
                  name="houseOrUnitNumber"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-address-houseOrUnitNumber">
                        House / Unit No.{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. 123"
                        type="text"
                        className="w-full rounded-sm text-xs lg:text-sm"
                      />
                      <FieldStateError fieldState={fieldState} />
                    </Field>
                  )}
                />

                <Controller
                  name="street"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-address-street">
                        Street <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Sunshine St."
                        type="text"
                        className="w-full rounded-sm text-xs lg:text-sm"
                      />
                      <FieldStateError fieldState={fieldState} />
                    </Field>
                  )}
                />

                {/* Region */}

                <Controller
                  control={control}
                  name="region"
                  rules={{ required: "Region is required" }}
                  render={({ field, fieldState }) => (
                    <Field className="w-full" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="region"
                        className="text-xs lg:text-sm"
                      >
                        Region <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Combobox
                        items={regions}
                        value={selectedRegion}
                        onValueChange={(item) => {
                          field.onChange(item?.name ?? "")
                          handleRegionChange(item)
                        }}
                        itemToStringLabel={(item) => item.name}
                        data-invalid={fieldState.invalid}
                      >
                        <ComboboxInput
                          placeholder="Select your region"
                          className="w-full rounded-sm text-xs lg:text-sm"
                        />
                        <ComboboxContent className="w-full rounded-sm">
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
                      <FieldStateError fieldState={fieldState} />
                    </Field>
                  )}
                />

                <div className="flex w-full items-center justify-between gap-2">
                  {(!selectedRegion || regionHasProvinces) && (
                    <Field className="flex-1">
                      <FieldLabel
                        htmlFor="province"
                        className="text-xs lg:text-sm"
                      >
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
                                  !selectedRegion
                                    ? "Select a region first"
                                    : "Select your province"
                                }
                                className="w-full rounded-sm text-xs lg:text-sm"
                              />
                              <ComboboxContent className="w-full rounded-sm">
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
                            <FieldStateError fieldState={fieldState} />
                          </>
                        )}
                      />
                    </Field>
                  )}

                  {/* City/Municipality */}
                  <Field className="flex-1">
                    <FieldLabel htmlFor="city" className="text-xs lg:text-sm">
                      City / Municipality{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="city"
                      rules={{ required: "City or Municipality is required" }}
                      render={({ field, fieldState }) => (
                        <>
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
                            <ComboboxContent className="w-full rounded-sm">
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
                          <FieldStateError fieldState={fieldState} />
                        </>
                      )}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex w-full flex-col gap-5 lg:w-1/2">
                {/* Barangay */}
                <Field className="w-full">
                  <FieldLabel htmlFor="barangay" className="text-xs lg:text-sm">
                    Barangay <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="barangay"
                    rules={{ required: "Barangay is required" }}
                    render={({ field, fieldState }) => (
                      <>
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
                            placeholder="Select your barangay"
                            className="w-full rounded-sm text-xs lg:text-sm"
                          />
                          <ComboboxContent className="w-full rounded-sm">
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
                        <FieldStateError fieldState={fieldState} />
                      </>
                    )}
                  />
                </Field>

                <Field className="w-full">
                  <FieldLabel htmlFor="landmark" className="text-xs lg:text-sm">
                    Landmark{" "}
                    <span className="text-muted-foreground/70">(optional)</span>
                  </FieldLabel>
                  <Input
                    className="w-full rounded-sm text-xs lg:text-sm"
                    placeholder="e.g. Next to Apollo Hospital"
                    {...register("landmark")}
                  />
                </Field>

                <Field className="w-full">
                  <FieldLabel
                    htmlFor="recipientName"
                    className="text-xs lg:text-sm"
                  >
                    Recipient Name{" "}
                    <span className="text-muted-foreground/70">(optional)</span>
                  </FieldLabel>
                  <Input
                    className="w-full rounded-sm text-xs lg:text-sm"
                    placeholder="e.g. John Doe"
                    {...register("recipientName")}
                  />
                </Field>

                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-address-phoneNumber">
                        Phone No.{" "}
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. 09991234567"
                        type="text"
                        className="w-full rounded-sm text-xs lg:text-sm"
                      />
                      <FieldStateError fieldState={fieldState} />
                    </Field>
                  )}
                />

                <Field orientation="horizontal">
                  <FieldLabel>
                    <input
                      type="checkbox"
                      className="relative size-5 appearance-none rounded-sm border border-gray-400 text-xs after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-xs after:text-white after:opacity-0 after:content-['✓'] checked:border-primary checked:bg-primary checked:after:opacity-100 lg:text-sm"
                      {...register("isDefault")}
                    />
                    Set as default delivery address
                  </FieldLabel>
                </Field>
              </div>
            </FieldGroup>
          </form>
          <div className="flex w-full items-center justify-center gap-2">
            <Button
              type="button"
              className="flex-1 cursor-pointer rounded-sm text-xs lg:text-sm"
              variant="outline"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="form-address"
              className="flex-1 cursor-pointer rounded-sm text-xs lg:text-sm"
            >
              {addressValues?.label ? "Save Changes" : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressForm
