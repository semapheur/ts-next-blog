import { type RefObject, useRef, useState } from "react"

export default function useStateRef<T>(
  initialValue?: T,
): [T | undefined, RefObject<T | undefined>, (value: T) => void] {
  const [state, _setState] = useState<T | undefined>(initialValue)
  const reference = useRef<T | undefined>(state)

  const setState = (value: T) => {
    reference.current = value
    _setState(value)
  }

  return [state, reference, setState]
}
