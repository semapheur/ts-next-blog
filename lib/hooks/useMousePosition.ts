"use client"

import { type RefObject, useEffect, useState } from "react"

export default function useMousePosition<
  T extends HTMLElement = HTMLDivElement,
>(elementRef: RefObject<T>): DOMPoint {
  const [position, setPosition] = useState<DOMPoint>(new DOMPoint(0, 0))

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const updatePosition = (e: MouseEvent) => {
      const { left, top } = element.getBoundingClientRect()
      setPosition(new DOMPoint(e.clientX - left, e.clientY - top))
    }

    window.addEventListener("mousemove", updatePosition)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
    }
  }, [elementRef])

  return position
}
