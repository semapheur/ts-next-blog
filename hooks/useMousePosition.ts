'use client'

import {RefObject, useEffect, useState} from 'react'

export default function useMousePosition<
  T extends HTMLElement = HTMLDivElement
>(
  elementRef: RefObject<T>
): DOMPoint {
  const [position, setPosition] = useState<DOMPoint>(new DOMPoint(0, 0))

  const updatePosition = (e: MouseEvent) => {
    const {left, top} = elementRef.current!.getBoundingClientRect()
    setPosition(new DOMPoint(e.clientX - left, e.clientY - top))
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    window.addEventListener('mousemove', updatePosition)

    return () => {
      element.removeEventListener('mousemove', updatePosition)
    }
  }, [elementRef])

  return position
}