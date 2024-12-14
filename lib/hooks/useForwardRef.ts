import { type ForwardedRef, useEffect, useRef } from "react"

export default function useForwardRef<T>(
  ref: ForwardedRef<T>,
  initial: T | null = null,
) {
  const targetRef = useRef<T>(initial)

  useEffect(() => {
    if (!ref) return

    if (typeof ref === "function") {
      ref(targetRef.current)
    } else {
      ref.current = targetRef.current
    }
  }, [ref])

  return targetRef
}
