export const getRatingRange = (key: string): [number, number] => {
  const ranges: Record<string, [number, number]> = {
    "0-3": [0, 3],
    "3.1-4.0": [3.1, 4.0],
    "4.1-4.5": [4.1, 4.5],
    "4.6-5.0": [4.6, 5.0],
    "0-5": [0, 5], // default / "All"
  }
  return ranges[key] || [0, 5]
}
