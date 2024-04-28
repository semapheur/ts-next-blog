'use client'

import useEventListener from 'hooks/useEventListener'
import React, { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {findAllIndices, sum} from 'utils/num'

type SizeFormat = string | string[] | number[]

type SplitProps = {
  split: 'row' | 'column',
  className: string,
  defaultSizes?: SizeFormat,
  minSizes: number[],
  children: ReactNode[]
}

type DragState = {
  index: number,
  startSizes: [number, number],
  dragInterval: [number, number]
  dragOrigin: number,
}

type DividerProps = {
  index: number,
  style: CSSProperties,
  onDragStart: (index: number, e: React.MouseEvent) => void,
}

type PaneProps = {
  style: CSSProperties,
  children: ReactNode
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider({index, style, onDragStart}, ref) {
  return (
    <div ref={ref} style={style} 
    className='opacity-0 hover:opacity-100 transition-opacity delay-300'
    onMouseDown={(e: React.MouseEvent) => {
      e.preventDefault
      onDragStart(index, e)
    }}
  />
  )
})

const Pane = forwardRef<HTMLDivElement, PaneProps>(function Pane({style, children}, ref) {
  return (
  <div ref={ref} style={style}>
    {children}
  </div>
  )
})
 
export default function Split(props: SplitProps) {
  const {split, className, defaultSizes, minSizes, children} = props

  const splitRef = useRef<HTMLDivElement>(null)
  const paneRefs = useRef<HTMLDivElement[]>([])
  const dividerRefs = useRef<HTMLDivElement[]>([])
  const sizeAttr = useRef<'width' | 'height'>(split === 'row' ? 'width' : 'height')
  const posAttr = useRef<'left' | 'top'>(split === 'row' ? 'left' : 'top')
  const [sizes, setSizes] = useState(Array<number>(children.length))
  const dragState = useRef<DragState|null>(null)
  
  const handleDragStart = useCallback((index: number, e: React.MouseEvent) => {
    const origin = split === 'row' ? e.clientX : e.clientY
    
    const startSizes: [number, number] = [
      paneRefs.current[index].getBoundingClientRect()[sizeAttr.current], 
      paneRefs.current[index + 1].getBoundingClientRect()[sizeAttr.current],
    ]

    dragState.current = {
      index: index, 
      startSizes: startSizes,
      dragInterval: [
        origin - (startSizes[0] - minSizes[index]),
        origin + (startSizes[1] - minSizes[index + 1]) 
      ],
      dragOrigin: origin
    }
  }, [split, minSizes])

  const resizePanes = useCallback((index: number, sizes: [number, number], delta: number) => {
    
    if (!paneRefs.current[index] || !paneRefs.current[index + 1]) return

    const pane1 = paneRefs.current[index]
    pane1.style[sizeAttr.current] = `${sizes[0] - delta}px`

    const pane2 = paneRefs.current[index + 1]
    pane2.style[sizeAttr.current] = `${sizes[1] + delta}px`

  }, [])

  const onDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.current) return

    const state = dragState.current

    const dragPos = split === 'row' ? e.clientX : e.clientY
    const delta = state.dragOrigin - dragPos

    const divider = dividerRefs.current[state.index]

    if (dragPos >= state.dragInterval[0] && dragPos <= state.dragInterval[1]) {
      divider.style[posAttr.current] = `${dragPos}px`
      resizePanes(state.index, state.startSizes, delta)
    }
  }, [split, resizePanes])

  const onDragStop = useCallback(() => {

    if (!dragState.current) return

    const index = dragState.current.index

    let pos = 0
    for(let i = 0; i <= index; i++) {
      pos += paneRefs.current[i].getBoundingClientRect()[sizeAttr.current]
    }
    dividerRefs.current[index].style[posAttr.current] = `${pos}px`

    dragState.current = null
  }, [])
  
  useEffect(() => {
    if (!splitRef.current) return 
    
    const splitRect = splitRef.current.getBoundingClientRect()
    setSizes(setDefaultSizes(defaultSizes, children.length, splitRect[sizeAttr.current]))
    
  }, [defaultSizes, children])
  
  useEventListener('mousemove', onDragMove, splitRef)
  useEventListener('mouseup', onDragStop, splitRef)

  const splitStyle: CSSProperties = {
    height: '100%',
    position: 'relative',
    display: 'flex',
    flex: '1',
    flexDirection: split
  }

  const dividerBaseStyle: CSSProperties = {
    position: 'absolute',
    cursor: split === 'row' ? 'ew-resize' : 'ns-resize',
    backgroundColor: 'rgb(var(--color-secondary) / 1)',
    transform: split === 'row' ? 'translateX(-50%)' : 'translateY(-50%)' 
  }
  dividerBaseStyle[sizeAttr.current] = '4px'
  dividerBaseStyle[split === 'row' ? 'height' : 'width'] = '100%'

  const elements: ReactNode[] = []
  for (let i = 0; i < children.length; i++) {
    const paneStyle: CSSProperties = split === 'row' ? {
      height: '100%',
      width: sizes[i],
      minWidth: minSizes[i]
    } : {
      height: sizes[i],
      width: '100%',
      minHeight: minSizes[i]
    }
    elements.push(
      <Pane key={`pane.${i}`} style={paneStyle}
        ref={(el: HTMLDivElement) => {paneRefs.current[i] = el}}
      >
        {children[i]}
      </Pane>
    )

    if (i < children.length - 1) {
      const dividerStyle = {...dividerBaseStyle}
      dividerStyle[posAttr.current] = sum(sizes, 0, i)

      elements.push(
        <Divider key={`divider.${i}`}
          index={i} style={dividerStyle}
          ref={(el: HTMLDivElement) => {dividerRefs.current[i] = el}}
          onDragStart={handleDragStart}
        />
      )
    }
  }
  return (
    <div className={className} style={splitStyle} ref={splitRef}>
      {elements}
    </div>
  )
}

function setDefaultSizes(defaultSizes: SizeFormat|undefined, panes: number, splitSize: number): number[] {
  
  function relativeSizes(sizes: number[], total: number, ceil: number) {

    if (total < ceil && sizes.includes(0)) {
      console.log('Invalid default sizes! Reverting to fallback sizes.')
      const ix = findAllIndices(sizes, 0)
      const remainderSize = (ceil - total) / ix.length

      for (const i of ix) sizes[i] = remainderSize
    }
    if (ceil !== splitSize) {
      for (const i in sizes) {
        sizes[i] *= splitSize / ceil
      }
    }
    return sizes
  }
  const result = Array<number>(panes).fill(splitSize/panes)

  if (!defaultSizes) return result

  if (typeof defaultSizes === 'string') {
    defaultSizes = defaultSizes.split(' ') ?? defaultSizes.split(',')
    if (!defaultSizes) {
      console.log('Invalid default sizes! Reverting to fallback sizes.')
      return result
    }
  }
  const sizes = Array<number>(Math.min(defaultSizes.length, panes)).fill(0)

  if (typeof defaultSizes[0] === 'string') {
    for (let i = 0; i < sizes.length; i++) {
      const size = parseFloat(defaultSizes[i] as string)
      if (size && size < 100) sizes[i] = size
    }
    const total = sum(sizes)

    if (total > 100 || (total === 100 && sizes.length < panes)) {
      console.log('Invalid default sizes! Reverting to fallback sizes.')
      return result
    }
    if (total < 100 && sizes.length < panes) {
      const pushes = panes - sizes.length

      for (let p = 0; p < pushes; p++) sizes.push(0)
    }
    return relativeSizes(sizes, total, 100)
  }
  
  if (typeof defaultSizes[0] === 'number') {
    const total = sum(defaultSizes as number[])

    if (total > splitSize) {
      console.log('Invalid default sizes! Reverting to fallback sizes.')
      return result
    }
    if (defaultSizes.length < panes) {
      const pushes = panes - defaultSizes.length

      for (let p = 0; p < pushes; p++) (defaultSizes as number[]).push(0)
    }
    for (const f of [1, 100, splitSize]) {
      const filtered = (defaultSizes as number[]).filter(s => s < f)

      if (filtered.length === panes) {
        return relativeSizes(defaultSizes as number[], total, f)
      }
    }
  }
  return result
}