'use client'

import {RefObject, useEffect, useState} from 'react'
import { Vec2 } from 'utils/types'

export default function useMousePosition<
  T extends HTMLElement = HTMLDivElement
>(
  elementRef: RefObject<T>
): Vec2 {
  const [position, setPosition] = useState<Vec2>({x: 0, y: 0})

  const updatePosition = (e: MouseEvent) => {
    const {left, top} = elementRef.current!.getBoundingClientRect()
    setPosition({
      x: e.clientX - left, 
      y: e.clientY - top}
    )
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