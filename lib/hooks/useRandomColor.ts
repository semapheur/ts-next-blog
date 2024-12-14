import { useEffect, useState } from "react"

export default function useRandomColor(initial?: string) {
  const [color, setColor] = useState("")

  const randomColor = () => {
    setColor(Math.random().toString(16))
  }

  useEffect(() => {
    if (initial) setColor(initial)
  }, [initial])

  return { color, randomColor }
}
