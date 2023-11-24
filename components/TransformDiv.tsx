'use client'

import { MouseEvent, useEffect, useState, useRef, HTMLProps, ReactNode } from 'react'
import {signal, Signal} from '@preact/signals-react'
import {Vec2} from 'utils/types'
import Vector from 'utils/vector'

type Transform2D = {
  scale: Vec2
  translate: Vec2
}

type ViewRange = {
  x: Vector,
  y: Vector
}

export const transform = signal<Transform2D>({
  scale: {x: 1, y: 1},
  translate: {x: 0, y: 0}
})

const viewRange = signal<ViewRange>({
  x: new Vector(-10, 10),
  y: new Vector(-10, 10)
})

interface Props extends HTMLProps<HTMLDivElement> {
  children: ReactNode
}

export default function TransformDiv({children, ...props}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isDragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState<Vec2>({x: 0, y: 0})

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 1) return

    setDragging(true)
    console.log(isDragging)
    setStartPos({
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {

      transform.value.translate.x += e.clientX - startPos.x
      transform.value.translate.y += e.clientY - startPos.y
      console.log(transform.value)

      setStartPos({
        x: e.clientX,
        y: e.clientY
      })
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  useEffect(() => {
    const div = divRef.current
    
    if (!div) return

    const {width, height} = div.getBoundingClientRect()
    viewRange.value = squareGrids(viewRange.value, width, height)
    transform.value = setTransform(viewRange.value, width, height)

  }, [])

  return (<div ref={divRef} {...props}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
  >
    {children}
  </div>)
}

function squareGrids(view: ViewRange, width: number, height: number): ViewRange {

  const viewLength = new Vector(
    view.x.diff() as number, 
    view.y.diff() as number
  )

  if (width < height) {
    const aspect = width / height
    const xLength = viewLength.y * aspect

    view.x = new Vector(
      view.x.mean - xLength/2,
      view.x.mean + xLength/2
    )
  } else if (width > height) {
    const aspect = height / width
    const yLength = viewLength.x * aspect

    view.y = new Vector(
      view.y.mean - yLength/2,
      view.y.mean + yLength/2
    )
  } else {
    const deltaLength = viewLength.diff() as number
    if (deltaLength < 0) {
      view.x = new Vector(
        view.x.mean - viewLength.y / 2,
        view.x.mean + viewLength.y / 2
      )
    } else if (deltaLength > 0) {
      view.y = new Vector(
        view.y.mean - viewLength.x / 2,
        view.y.mean + viewLength.x / 2
      )
    }
  }
  return view
}

function setTransform(viewRange: ViewRange, width: number, height: number): Transform2D {
  const viewLength = new Vector(
    viewRange.x.diff() as number, 
    viewRange.y.diff() as number
  )

  return{
    scale: {
      x: width / viewLength.x,
      y: height / viewLength.y
    },
    translate: {
      x: width * (viewRange.x[0] / viewLength.x),
      y: height * (viewRange.y[0] / viewLength.y),
    }
  } 
}

function setScale(viewRange: ViewRange, width: number, height: number) {
  const viewLength = new Vector(
    viewRange.x.diff() as number, 
    viewRange.y.diff() as number
  )

  return {
    x: width / viewLength.x,
    y: height / viewLength.y
  }
}


