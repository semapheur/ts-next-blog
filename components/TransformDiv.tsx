'use client'

import { MouseEvent, useState, useRef, HTMLProps, ReactNode } from 'react'
import {Vec2} from 'utils/types'

interface Props extends HTMLProps<HTMLDivElement> {
  children: ReactNode
}

export default function TransformDiv({children, ...props}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isDragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState<Vec2>({x: 0, y: 0})

  const handleMouseDown = (e: MouseEvent) => {
    setDragging(true)
    setStartPos({
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {

      const delta = {
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      }

      setStartPos({
        x: e.clientX,
        y: e.clientY
      })
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  return (<div ref={divRef} {...props}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
  >
    {children}
  </div>)
}