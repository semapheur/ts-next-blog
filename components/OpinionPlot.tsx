'use client'

import {useEffect, useRef, useState} from 'react'
import SVGTernaryPlot, {ternary$, TernaryValue} from './svgternary'

export default function OpinionPlot() {

  const [value, setValue] = useState<TernaryValue>()
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGTernaryPlot|null>(null)
  //const size = useResizeObserver(wrapRef)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (!svgRef.current && wrapper) {
      
      svgRef.current = new SVGTernaryPlot(wrapper)
      svgRef.current.grid()
      svgRef.current.axis()

      const sub = ternary$.subscribe(setValue)
      
      return () => {
        svgRef.current?.cleanup()
        sub?.unsubscribe()
      }
    };
  }, []);

  useEffect(() => {
    console.log(value)
  }, [value]);

  return (
    <div ref={wrapRef}
      className='h-full bg-primary shadow-inner-l dark:shadow-black/50'
    />
  )
}