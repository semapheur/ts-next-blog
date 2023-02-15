'use client'

import { useCallback, useEffect, useRef } from 'react'

import { drawCurve, ValueNoise } from 'utils/noise'
import { svgCatmullRom } from 'utils/svg'
import Vector from 'utils/vector'

const valNoise = new ValueNoise(2011, 256)

export default function WaveFooter() {
  const requestRef = useRef<number>(null)
  const offsetRef = useRef<number>(0)
  const wrapRef = useRef<HTMLElement>(null)
  const waveRef = useRef<SVGPathElement>(null)

  const animate: FrameRequestCallback = useCallback((time: number) => {
    const wrap = wrapRef.current
    const wave = waveRef.current

    const height = wrap.getBoundingClientRect().height
    const width = wrap.getBoundingClientRect().width

    // Wave
    let a = new Vector(0, 0.2 * height)
    let b = new Vector(width, 0.2 * height)

    let curve = drawCurve(a, b, valNoise, 30, 0.2*height, 1/10, offsetRef.current, 5)
    let d = svgCatmullRom(curve, 1) + `L${width},${height}L0,${height}Z`
    wave.setAttribute('d', d)
    offsetRef.current += 0.01

    requestRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])
  
  return (
    <footer className='h-40 bg-amber-100 dark:bg-stone-600' ref={wrapRef}>
      <svg xmlns='http://www.w3.org/2000/svg' className='h-full w-full'>
        <defs>
          <linearGradient id='ocean' gradientTransform='rotate(90)'>
            <stop offset='0%' stopColor='rgba(0,159,253,1)'/>
            <stop offset='100%' stopColor='rgba(42,42,114,1)'/>
          </linearGradient>
        </defs>
        <path ref={waveRef} fill='url(#ocean)'/>
      </svg>
    </footer>
  )
}