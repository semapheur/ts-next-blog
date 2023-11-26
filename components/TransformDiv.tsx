'use client'

import { MouseEvent, useEffect, useRef, HTMLProps, ReactNode, WheelEvent } from 'react'
import {signal, Signal} from '@preact/signals-react'
import {ViewRange} from 'utils/types'
import Vector from 'utils/vector'

export const transform = signal(new DOMMatrix([1, 0, 0, 1, 0, 0]))

interface Props extends HTMLProps<HTMLDivElement> {
  viewRange: Signal<ViewRange>
  children: ReactNode
}

export default function TransformDiv({viewRange, children, ...props}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef<DOMPoint>(new DOMPoint(0,0))

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 1) return

    isDragging.current = true
    startPos.current = new DOMPoint(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      transform.value.e += e.clientX - startPos.current.x 
      transform.value.f -= e.clientY - startPos.current.y 

      startPos.current = new DOMPoint(e.clientX, e.clientY)
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    const div = divRef.current
    
    if (!div) return

    const {height, left, top} = div.getBoundingClientRect()

    const zoomFactor = 1 + Math.sign(-e.deltaY) * 0.1
    const zoomPos = new DOMPoint(e.clientX - left, height - e.clientY + top)
      
    transform.value.a *= zoomFactor
    transform.value.d *= zoomFactor
    transform.value.e = zoomPos.x + (transform.value.e - zoomPos.x) * zoomFactor
    transform.value.f = zoomPos.y + (transform.value.f - zoomPos.y) * zoomFactor
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
    onWheel={handleWheel}
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

function setTransform(viewRange: ViewRange, width: number, height: number): DOMMatrix {
  const viewLength = new Vector(
    viewRange.x.diff() as number, 
    viewRange.y.diff() as number
  )

  return new DOMMatrix([
    width / viewLength.x,
    0, 0,
    height / viewLength.y,
    width * (-viewRange.x[0] / viewLength.x),
    height * (-viewRange.y[0] / viewLength.y),
  ])
}


