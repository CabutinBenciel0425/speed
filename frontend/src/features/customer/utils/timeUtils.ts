// features/customer/utils/timeUtils.ts
export const TIME_RANGES = {
  "0-15": { min: 0, max: 15 },
  "15-30": { min: 15, max: 30 },
  "30-45": { min: 30, max: 45 },
  "45+": { min: 45, max: Infinity },
} as const

export type TimeRangeKey = keyof typeof TIME_RANGES

export const getTimeRangeFromSelected = (
  selected: string[]
): { min: number; max: number } | null => {
  if (selected.length === 0) return null

  const ranges = selected
    .filter((key): key is TimeRangeKey => key in TIME_RANGES)
    .map((key) => TIME_RANGES[key as TimeRangeKey])

  if (ranges.length === 0) return null

  return {
    min: Math.min(...ranges.map((r) => r.min)),
    max: Math.max(...ranges.map((r) => r.max)),
  }
}
