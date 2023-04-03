'use client'

import {useEffect, useRef} from 'react'
import { SVGTernaryPlot } from './svgternary'

export default function Ternary() {

  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGTernaryPlot|null>(null)
  //const size = useResizeObserver(wrapRef)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (!svgRef.current && wrapper) {
      
      svgRef.current = new SVGTernaryPlot(wrapper)
      
      //return () => {
      //  svgRef.current.cleanup()
      //}
    };
  }, []);

  return (
    <div ref={wrapRef}
      className='h-full bg-primary shadow-inner-l dark:shadow-black/50'
    />
  )
}