import { useRef } from "react"

export default function useIsFirstRender(): boolean {
  const isFirst = useRef<boolean>(true)

  if (isFirst.current) {
    isFirst.current = false

    return true
  }
  return isFirst.current
}
