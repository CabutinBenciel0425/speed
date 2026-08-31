import { useEffect, useState } from "react"

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState("")
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value.trim())
    }, delay)

    return () => clearTimeout(handler)
  }, [delay, value])

  return debouncedValue
}
