import { useState } from "react"

export default function useForceUpdate() {
  const [value, setValue] = useState<number>(0)
  return () => setValue((value) => (value + 1) % 3)
}
