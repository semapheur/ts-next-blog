'use client'

import { MouseEvent, useState, useRef, HTMLProps, ReactNode } from 'react'
import {Signal} from '@preact/signals-react'
import {Vec2} from 'utils/types'

type Transform2D = {
  scale: Vec2
  translate: Vec2
}

interface Props extends HTMLProps<HTMLDivElement> {
  transform: Signal<Transform2D>
  children: ReactNode
}

export default function TransformDiv({transform, children, ...props}: Props) {
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

      transform.value.translate.x += e.clientX - startPos.x
      transform.value.translate.y += e.clientY - startPos.y

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