'use client'

import useObservable from 'hooks/useObservable'
import useSubscription from 'hooks/useSubscription'
import {useEffect, useRef, useState} from 'react'
import { BehaviorSubject } from 'rxjs'
import SVGTernaryPlot, {ternary$, TernaryValue} from './svgternary'

export default function OpinionPlot() {

  //const [value, setValue] = useState<TernaryValue>(ternary$.getValue())
  //const [value, setValue] = useReferredState<TernaryValue>()
  const value = useObservable(ternary$)
  
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGTernaryPlot|null>(null)
  //const size = useResizeObserver(wrapRef)

  //useSubscription<TernaryValue>(ternary$, (n) => setValue(n))

  useEffect(() => {
    const wrapper = wrapRef.current
    if (!svgRef.current && wrapper) {
      
      svgRef.current = new SVGTernaryPlot(wrapper)
      svgRef.current.grid()
      svgRef.current.axis()
      svgRef.current.point()
      
      return () => {
        svgRef.current?.cleanup()
      }
    }
  }, [])

  
  //useEffect(() => {
  //  const sub = ternary$.subscribe(setValue)
  //  console.log(value)
  //    
  //  return () => {
  //    sub?.unsubscribe()
  //  }
  //}, [ternary$])
  console.log(value)

  return (
    <div className='h-full flex'>
      <div ref={wrapRef}
        className='h-full w-1/2 bg-primary shadow-inner-l dark:shadow-black/50'
      />
      <p>{value.point[1].toFixed(2)}</p>
    </div>
    
  )
}