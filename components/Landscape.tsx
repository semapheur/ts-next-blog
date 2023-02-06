'use client'

import useResizeObserver from 'hooks/useResizeObserver';
import { useEffect, useRef } from 'react';
import { drawHill, ValueNoise } from 'utils/noise';
import { brownianBridge } from 'utils/random';
import { svgCatmullRom } from 'utils/svg';
import Vector from 'utils/vector';

const colorMatrix = [
  '0 0 0 9 -4',
  '0 0 0 9 -4',
  '0 0 0 9 -4',
  '0 0 0 0 1'
];

const valNoise = new ValueNoise(2011, 256)

function drawMountain(wayPoints: Vector[], numPoints: number[], amplitude: number[]) {
  const result: Vector[] = []

  for (let i = 0; i < wayPoints.length-1; i++) {
      
    let segment = brownianBridge(wayPoints[i], wayPoints[i+1], numPoints[i], amplitude[i])
    if (i < wayPoints.length - 2) {
      segment.pop()
    }
    result.push(...segment)
  }
  return result
}

export default function Landscape() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const hill1Ref = useRef<SVGPathElement>(null)
  const hill2Ref = useRef<SVGPathElement>(null)
  const hill3Ref = useRef<SVGPathElement>(null)
  const hill4Ref = useRef<SVGPathElement>(null)
  const hill5Ref = useRef<SVGPathElement>(null)

  const size = useResizeObserver(wrapRef)

  useEffect(() => {

    if (!size) return

    const {height: h, width: w} = size

    const hill1 = hill1Ref.current
    const hill2 = hill2Ref.current
    const hill3 = hill3Ref.current
    const hill4 = hill4Ref.current
    const hill5 = hill5Ref.current
    
    // Hill 1
    let wp = [
      new Vector(0, 0.8*h),
      new Vector(0.5*w, 0.9*h),
      new Vector(w, 0.8*h)
    ]
    let hill = drawHill(wp, valNoise, [5, 5], [0.03*h, 0.03*h], [10, 10], [0,0], [1, 1])
    let d = svgCatmullRom(hill, 0.7) + `L${w},${h}L0,${h}Z`
    hill1.setAttribute('d', d)

    // Hill 2
    wp = [
      new Vector(0, 0.5*h),
      new Vector(0.1*w, 0.6*h),
      new Vector(0.5*w, 0.85*h),
      new Vector(0.9*w, 0.6*h),
      new Vector(w, 0.5*h)
    ]
    hill = drawMountain(wp, [10, 30, 30, 10], 
      [1, 2, 2, 1])
    d = svgCatmullRom(hill, 0.7) + `L${w},${h}L0,${h}Z`
    hill2.setAttribute('d', d)

    // Hill 3
    wp = [
      new Vector(0, 0.6*h),
      new Vector(0.2*w, 0.6*h),
      new Vector(0.5*w, 0.80*h),
      new Vector(0.8*w, 0.6*h),
      new Vector(w, 0.5*h)
    ]
    hill = drawMountain(wp, [10, 20, 20, 10], 
      [1, 3, 3, 1])
    d = svgCatmullRom(hill, 0.7) + `L${w},${h}L0,${h}Z`
    hill3.setAttribute('d', d)

    // Hill 4
    wp = [
      new Vector(0, 0.4*h),
      new Vector(0.1*w, 0.5*h),
      new Vector(0.5*w, 0.75*h),
      new Vector(0.9*w, 0.5*h),
      new Vector(w, 0.4*h)
    ]
    hill = drawMountain(wp, [10, 15, 15, 10], 
      [3, 3, 3, 3])
    d = svgCatmullRom(hill, 0.7) + `L${w},${h}L0,${h}Z`
    hill4.setAttribute('d', d)

    // Hill 5
    wp = [
      new Vector(0, 0.7*h),
      new Vector(0.35*w, 0.7*h),
      new Vector(0.5*w, 0.5*h),
      new Vector(0.65*w, 0.7*h),
      new Vector(w, 0.7*h)
    ]
    hill = drawMountain(wp, [10, 100, 100, 10], 
      [1, 1, 1, 1])
    d = svgCatmullRom(hill, 0.7) + `L${w},${h}L0,${h}Z`
    hill5.setAttribute('d', d)

  }, [size])
  
  return (
    <div ref={wrapRef} className='relative h-full transform-style-3d z-[-1]'
    >
      <svg xmlns='http://www.w3.org/2000/svg' 
        className='h-full w-full origin-bottom-left translate-z-[-5px] scale-[6]'
      >
        <defs>
          <filter id='starsky'>
            <feTurbulence baseFrequency='.2' />
            <feColorMatrix values={colorMatrix.join('  ')}/>
          </filter>
        </defs>
        <rect width='100%' height='100%' filter='url(#starsky)'/>
      </svg>
      <div className='absolute inset-0 h-full w-full 
        origin-bottom-left translate-z-[-5px] scale-[6]
        opacity-0 dark:opacity-100 transition-opacity delay-[2s] duration-1000 
        bg-[linear-gradient(rgba(0,11,22,0.1)40%,rgba(13,98,245,1)80%,rgba(57,167,255,1)100%)]'
      />
      <div className='absolute inset-0 h-full w-full 
        origin-bottom-left translate-z-[-5px] scale-[6] 
        bg-[length:100%_200%] bg-bottom dark:bg-top dark:opacity-0
        [transition:opacity_2s_ease-in,background-position_1s_ease-out]
        bg-[radial-gradient(circle_at_50%_60%,rgba(242,248,247,1)0%,rgba(249,249,28,1)3%,rgba(247,214,46,1)8%,rgba(248,200,95,1)12%,rgba(201,165,132,1)30%,rgba(115,130,133,1)51%,rgba(46,97,122,1)85%,rgba(24,75,106,1)100%)]'
      />
      <svg xmlns='http://www.w3.org/2000/svg' 
        className='absolute inset-0 h-full w-full origin-bottom-left translate-z-[-4px] scale-[5]'
      >
        <path ref={hill5Ref} className='fill-amber-900 dark:fill-stone-200'/>
      </svg>
      <svg xmlns='http://www.w3.org/2000/svg' 
        className='absolute inset-0 h-full w-full origin-bottom-left translate-z-[-3px] scale-[4]'
      >
        <path ref={hill4Ref} className='fill-amber-700 dark:fill-stone-300'/>
      </svg>
      <svg xmlns='http://www.w3.org/2000/svg' 
        className='absolute inset-0 h-full w-full origin-bottom-left translate-z-[-2px] scale-[3]'
      >
        <path ref={hill3Ref} className='fill-amber-500 dark:fill-stone-400'/>
      </svg>
      <svg xmlns='http://www.w3.org/2000/svg' 
        className='absolute inset-0 h-full w-full origin-bottom-left translate-z-[-1px] scale-[2]'
      >
        <path ref={hill2Ref} className='fill-amber-300 dark:fill-stone-500'/>
      </svg>
      <svg xmlns='http://www.w3.org/2000/svg' className='absolute inset-0 h-full w-full'>
        <path ref={hill1Ref} className='fill-amber-100 dark:fill-stone-600'/>
      </svg>
    </div>)
}