import axios from "@/lib/axios"

type PSGCRecord = { code: string; name: string; [key: string]: unknown }

export type PSGCRegion = {
  code: string
  name: string
  psgc10DigitCode: string
}

export type PSGCProvince = {
  code: string
  name: string
  regionCode: string
  psgc10DigitCode: string
}

export type PSGCCitiesMunicipality = {
  code: string
  name: string
  regionCode: string
  provinceCode: string
  psgc10DigitCode: string
  isCapital?: boolean
  geographicLevel: "City" | "Mun" | "SubMun"
}

export type PSGCBarangay = {
  code: string
  name: string
  cityMunicipalityCode: string
  provinceCode: string
  regionCode: string
  psgc10DigitCode: string
  isPoblacion?: boolean
}

const fetchAll = async <T>(
  endpoint: string,
  mapRecord: (record: PSGCRecord) => T
): Promise<T[]> => {
  const { data: payload } = await axios.get(endpoint)
  const records = Array.isArray(payload) ? payload : payload.data
  if (!Array.isArray(records))
    throw new Error("Location service returned an unexpected response.")
  return records.map(mapRecord)
}

const region = (item: PSGCRecord): PSGCRegion => ({
  code: item.code,
  name: item.name,
  psgc10DigitCode: item.code,
})

const province = (item: PSGCRecord): PSGCProvince => ({
  code: item.code,
  name: item.name,
  regionCode: String(item.region ?? ""),
  psgc10DigitCode: item.code,
})

const cityMunicipality = (item: PSGCRecord): PSGCCitiesMunicipality => ({
  code: item.code,
  name: item.name,
  regionCode: String(item.region ?? ""),
  provinceCode: String(item.province ?? ""),
  psgc10DigitCode: item.code,
  isCapital: Boolean(item.is_capital),
  geographicLevel: String(item.type ?? "")
    .toLowerCase()
    .includes("city")
    ? "City"
    : "Mun",
})

const barangay = (item: PSGCRecord): PSGCBarangay => ({
  code: item.code,
  name: item.name,
  cityMunicipalityCode: String(item.city_municipality ?? ""),
  provinceCode: String(item.province ?? ""),
  regionCode: String(item.region ?? ""),
  psgc10DigitCode: item.code,
  isPoblacion: false,
})

const codePath = (code: string) => encodeURIComponent(code)

export const psgcService = {
  getRegions: () => fetchAll("/location/regions", region),
  getProvincesByRegion: (code: string) =>
    fetchAll(`/location/regions/${codePath(code)}/provinces`, province),
  getCitiesMunicipalitiesByRegion: (code: string) =>
    fetchAll(
      `/location/regions/${codePath(code)}/cities-municipalities`,
      cityMunicipality
    ),
  getCitiesMunicipalitiesByProvince: (code: string) =>
    fetchAll(
      `/location/provinces/${codePath(code)}/cities-municipalities`,
      cityMunicipality
    ),
  getBarangays: (code: string) =>
    fetchAll(
      `/location/cities-municipalities/${codePath(code)}/barangays`,
      barangay
    ),
}
