import { useState, useEffect } from "react"

export const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds])

  const reset = (newSeconds: number) => {
    setSeconds(newSeconds)
  }

  return { seconds, reset, isRunning: seconds > 0 }
}
