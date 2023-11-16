'use client'

import CanvasGrid from 'components/CanvasGrid'
import useResizeObserver from 'hooks/useResizeObserver'
import { useEffect, useRef } from 'react'

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<CanvasGrid|null>(null)
  //const size = useResizeObserver(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!gridRef.current && canvas) {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      gridRef.current = new CanvasGrid(canvas)
      gridRef.current.animate(0)
    }
    
  }, [])

  return (
    <canvas ref={canvasRef} className='w-full h-full'/>
  )
}