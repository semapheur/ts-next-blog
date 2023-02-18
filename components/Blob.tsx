'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'
import { svgCatmullRom } from 'utils/svg'

import Vector from 'utils/vector' 

function circlePoints(radius: number, numPoints: number, origin: Vector): Vector[] {
  const points = Array<Vector>(numPoints).fill(origin)
  const angleStep = (Math.PI * 2) / numPoints

  return points.map((p,i) => {
    const theta = i * angleStep
    const point = new Vector(Math.cos(theta), Math.sin(theta))
    return p.add(point.scale(radius))
  })
}

type Interval = {
  start: number,
  end: number
}

function mapRange(n: number, i1: Interval, i2: Interval): number {
  return ((n - i1.start) / (i1.end - i1.start)) * (i2.end - i2.start) + i2.start
}

function noiseOffset(points: Vector[]): Vector[] {
  const result = Array<Vector>(points.length)

  for (let i in points) {
    const offset = points[i].map(() => Math.random() * 1000)
    result[i] = new Vector(...offset)
  }
  return result
}

const origin = new Vector(50, 50)
const radius = 30
const circle = circlePoints(radius, 6, origin)
const points = [...circle]
const offsets = noiseOffset(circle)
const noiseStep = 0.005

const simplex2D = createNoise2D()

function noiseVec(offset: Vector, ix: Interval, iy: Interval): Vector {
  const i0 = {start: -1, end: 1}

  const nx = simplex2D(offset.x, offset.x)
  const ny = simplex2D(offset.y, offset.y)

  return new Vector(
    mapRange(nx, i0, ix),
    mapRange(ny, i0, iy)
  )
}

type Props = {
  className: string
}

export default function Blob({className}: Props) {
  const requestRef = useRef<number>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const pointsRef = useRef<Vector[]>(points)
  const offsetsRef = useRef<Vector[]>(offsets)
  const hueOffsetRef = useRef<number>(0)
  const stopRef1 = useRef<SVGStopElement>();
  const stopRef2 = useRef<SVGStopElement>()

  const animate: FrameRequestCallback = useCallback((time: number) => {
    const path = pathRef.current
    path.setAttribute('d', svgCatmullRom(pointsRef.current, 1, true))

    // Update path
    for (let i in pointsRef.current) {
      const offset = offsetsRef.current[i]

      const wobbleNoise = noiseVec(offset, 
        {start: circle[i].x - radius*0.2, end: circle[i].x + radius*0.2},
        {start: circle[i].y - radius*0.2 , end: circle[i].y + radius*0.2}
      )
      
      pointsRef.current[i] = wobbleNoise
      offsetsRef.current[i] = offset.addScalar(noiseStep)
    }

    // Update hue of linear gradient
    const hueNoise = simplex2D(hueOffsetRef.current, hueOffsetRef.current)
    const hue = mapRange(hueNoise, {start: -1, end: 1}, {start: 0, end: 360});
    hueOffsetRef.current += noiseStep/10;

    document.documentElement.style.setProperty(
      '--color-blob-start', `hsl(${hue}, 100%, 75%)`);
    document.documentElement.style.setProperty(
      '--color-blob-stop', `hsl(${hue + 60}, 100%, 75%)`);

    requestRef.current = requestAnimationFrame(animate)
  },[])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])
  
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' 
      className={className}
    >
      <defs>
        <linearGradient id='blob-gradient' gradientTransform='rotate(90)'>
          <stop id='gradientStop1' offset='0%' stopColor='var(--color-blob-start)' 
            ref={stopRef1}/>
          <stop id='gradientStop2' offset='100%' stopColor='var(--color-blob-stop)' 
            ref={stopRef2}/>
        </linearGradient>
        <filter id='blob-blur'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='0.3' />
        </filter>
      </defs>
      <path ref={pathRef} fill='url(#blob-gradient)' filter='url(#blob-blur)'/>
    </svg>
  )
}
