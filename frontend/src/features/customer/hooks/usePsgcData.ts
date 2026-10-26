import { useQuery } from "@tanstack/react-query"
import { psgcService } from "@/services/psgcService"

const ONE_DAY = 1000 * 60 * 60 * 24

export const useRegions = () =>
  useQuery({
    queryKey: ["psgc", "regions"],
    queryFn: psgcService.getRegions,
    staleTime: ONE_DAY,
  })

export const useProvincesByRegion = (regionPsgc10: string) =>
  useQuery({
    queryKey: ["psgc", "provinces", regionPsgc10],
    queryFn: () => psgcService.getProvincesByRegion(regionPsgc10),
    enabled: !!regionPsgc10,
    staleTime: ONE_DAY,
  })

export const useCitiesMunicipalities = ({
  regionPsgc10,
  provincePsgc10,
}: {
  regionPsgc10?: string
  provincePsgc10?: string
}) =>
  useQuery({
    queryKey: [
      "psgc",
      "cities-municipalities",
      provincePsgc10 ?? regionPsgc10 ?? "",
    ],
    queryFn: () =>
      provincePsgc10
        ? psgcService.getCitiesMunicipalitiesByProvince(provincePsgc10)
        : psgcService.getCitiesMunicipalitiesByRegion(regionPsgc10!),
    enabled: !!(provincePsgc10 || regionPsgc10),
    staleTime: ONE_DAY,
  })

export const useBarangays = (cityMunicipalityPsgc10: string) =>
  useQuery({
    queryKey: ["psgc", "barangays", cityMunicipalityPsgc10],
    queryFn: () => psgcService.getBarangays(cityMunicipalityPsgc10),
    enabled: !!cityMunicipalityPsgc10,
    staleTime: ONE_DAY,
  })
