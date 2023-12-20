'use client'

import { PointerEvent, useEffect, useRef, HTMLProps, ReactNode, WheelEvent, useState } from 'react'
import {signal, Signal} from '@preact/signals-react'
import {ViewRange} from 'utils/types'
import Vector from 'utils/vector'
import { screenToDrawPosition } from 'utils/svg'

export const transform = signal(new DOMMatrix([1, 0, 0, 1, 0, 0]))

type Props = {
  viewRange: Signal<ViewRange>
  children: ReactNode
} & HTMLProps<HTMLDivElement>

export default function TransformDiv({viewRange, children, ...props}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef<DOMPoint>(new DOMPoint(0,0))
  const divSize = useRef<DOMPoint>(new DOMPoint(0,0))

  function handleResize() {
    const div = divRef.current
    if (!div) return
    
    const oldSize = divSize.current
    
    const viewport = document.querySelector('meta[name=viewport]')
    viewport?.setAttribute('content', `height=${oldSize.y}px, width=device-width, initial-scale=1.0`)

    const {width, height} = div.getBoundingClientRect()
    const currentViewRange = getViewRange(transform.value, oldSize.x, oldSize.y)
    transform.value = setTransform(currentViewRange, width, height)
    divSize.current = new DOMPoint(width, height)

    viewport?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0')
  }

  function handlePointerDown(event: PointerEvent) {
    if (!['pen', 'touch'].includes(event.pointerType) && event.button !== 1) return
    isDragging.current = true
    startPos.current = new DOMPoint(event.clientX, event.clientY)
  }

  function handlePointerMove(event: PointerEvent) {
    if (isDragging.current) {
      event.preventDefault()
      
      transform.value.e += event.clientX - startPos.current.x 
      transform.value.f += event.clientY - startPos.current.y 

      startPos.current = new DOMPoint(event.clientX, event.clientY)
    }
  }

  function handlePointerUp() {
    isDragging.current = false
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const div = divRef.current
    if (!div) return

    const {left, top} = div.getBoundingClientRect()

    const zoomFactor = 1 + Math.sign(-event.deltaY) * 0.1
    const zoomPos = new DOMPoint(event.clientX - left, event.clientY - top)
      
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
    divSize.current = new DOMPoint(width, height)

    div.addEventListener('resize', handleResize)

    return () => {
      div.removeEventListener('resize', handleResize)
    }
  })

  return (<div ref={divRef} {...props} style={{touchAction: 'none'}}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
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

function getViewRange(matrix: DOMMatrix, width: number, height: number): ViewRange {

  const x0y0 = screenToDrawPosition(new DOMPoint(0, 0), matrix)
  const x1y1 = screenToDrawPosition(new DOMPoint(width, height), matrix)

  const newViewRange = {
    x: new Vector(x0y0.x, x1y1.x),
    y: new Vector(x0y0.y, x1y1.y)
  }

  return squareGrids(newViewRange, width, height)
}