'use client'

import {useEffect, useRef} from 'react'
import {observer} from 'mobx-react-lite'
import SVGTernaryPlot, {TernaryStore} from './svgternary'
import { computed, makeObservable } from 'mobx'

const initialTernaryValue = {
  point: [1/3, 1/3, 1/3],
  director: 0.5
}

class OpinionStore extends TernaryStore {
  constructor(point: number[], director: number) {
    super(point, director)

    makeObservable(this, {
      belief: computed,
      disbelief: computed,
      uncertainty: computed,
      baseRate: computed,
      probability: computed
    })
  }

  get belief() {
    return this.point[1]
  }

  get disbelief() {
    return this.point[0]
  }

  get uncertainty() {
    return this.point[2]
  }

  get baseRate() {
    return this.director
  }

  get probability() {
    return this.point[1] + this.point[2] * this.director
  }
}

const opinion = new OpinionStore(
  initialTernaryValue.point, 
  initialTernaryValue.director
)

function OpinionPlot() {
  
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGTernaryPlot|null>(null)
  //const size = useResizeObserver(wrapRef)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (!svgRef.current && wrapper) {
      
      svgRef.current = new SVGTernaryPlot(wrapper)
      svgRef.current.grid()
      svgRef.current.axis()
      svgRef.current.director(undefined, opinion)
      svgRef.current.point(undefined, opinion)
      
      return () => {
        svgRef.current?.cleanup()
      }
    }
  }, [])

  return (
    <div className='h-full flex'>
      <div ref={wrapRef}
        className='h-full w-1/2 bg-primary shadow-inner-l dark:shadow-black/50'
      />
      <ul>
        <b>Opinion</b>
        <li><b>Belief: </b>{opinion.belief.toFixed(2)}</li>
        <li><b>Disbelief: </b>{opinion.disbelief.toFixed(2)}</li>
        <li><b>Uncertainty: </b>{opinion.uncertainty.toFixed(2)}</li>
        <li><b>Base rate: </b>{opinion.baseRate.toFixed(2)}</li>
        <li><b>Probability: </b>{opinion.probability.toFixed(2)}</li>
      </ul>
    </div>
  )
}

export default observer(OpinionPlot)