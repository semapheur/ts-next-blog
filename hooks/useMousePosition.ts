'use client'

import {RefObject, useEffect, useState} from 'react'

type Position = {
  x: number|null,
  y: number|null
}

export default function useMousePosition(elementRef: RefObject<Element>): Position {
  const [position, setPosition] = useState<Position>({x: null, y: null})

  const updatePosition = (e: MouseEvent) => {
    const boundingRect = elementRef.current!.getBoundingClientRect()
    setPosition({
      x: e.clientX - boundingRect.left, 
      y: e.clientY - boundingRect.top}
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