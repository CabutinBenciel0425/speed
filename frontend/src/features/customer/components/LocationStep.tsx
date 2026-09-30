import { useFormContext } from "react-hook-form"
import type { AddressFormValues } from "../types/address"
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
import { useState } from "react"

function LocationStep() {
  const { control, setValue, watch } = useFormContext<AddressFormValues>()

  const region = watch("region")
  const province = watch("province")
  const city = watch("city")
  const barangay = watch("barangay")

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

  const { data: citiesMunicipalities = [] } = useCitiesMunicipalities({
    regionPsgc10: selectedRegion?.psgc10DigitCode,
    provincePsgc10: selectedProvince?.psgc10DigitCode,
  })

  const { data: barangays = [] } = useBarangays(
    selectedCity?.psgc10DigitCode ?? ""
  )

  return <div></div>
}

export default LocationStep
