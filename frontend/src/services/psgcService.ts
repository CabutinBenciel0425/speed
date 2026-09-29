// frontend/src/services/psgcService.ts
const PSGC_BASE = "https://psgc.thecodebit.space/api/v1"

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

const fetchAll = async <T>(endpoint: string): Promise<T[]> => {
  const url = `${PSGC_BASE}${endpoint}?limit=2000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`PSGC API error: ${res.status}`)
  const json = await res.json()

  console.log(json)
  return json.data as T[]
}

export const psgcService = {
  getRegions: () => fetchAll<PSGCRegion>("/region"),

  getProvincesByRegion: (regionPsgc10: string) =>
    fetchAll<PSGCProvince>(`/region/${regionPsgc10}/provinces`),

  getCitiesMunicipalitiesByRegion: (regionPsgc10: string) =>
    fetchAll<PSGCCitiesMunicipality>(
      `/region/${regionPsgc10}/cities-municipalities`
    ),

  getCitiesMunicipalitiesByProvince: (provincePsgc10: string) =>
    fetchAll<PSGCCitiesMunicipality>(
      `/province/${provincePsgc10}/cities-municipalities`
    ),

  getBarangays: (cityMunicipalityPsgc10: string) =>
    fetchAll<PSGCBarangay>(`/municipality/${cityMunicipalityPsgc10}/barangays`),
}
