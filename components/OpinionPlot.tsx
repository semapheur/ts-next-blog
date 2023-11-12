'use client'

import {useEffect, useRef} from 'react'
import {observer} from 'mobx-react-lite'
import SVGTernaryPlot, {OpinionStore} from './SvgTernary'

import DensityPlot from './DensityPlot'

const initialTernaryValue = {
  point: [1/3, 1/3, 1/3],
  director: 0.5
}

const opinion = new OpinionStore(
  initialTernaryValue.point, 
  initialTernaryValue.director
)

function OpinionPlot() {
  
  const ternaryWrapRef = useRef<HTMLDivElement>(null)
  const ternaryRef = useRef<SVGTernaryPlot|null>(null)

  useEffect(() => {
    const ternaryWrapper = ternaryWrapRef.current
    if (!ternaryRef.current && ternaryWrapper) {
      
      ternaryRef.current = new SVGTernaryPlot(ternaryWrapper, initialTernaryValue)
      ternaryRef.current.grid()
      ternaryRef.current.axis()
      ternaryRef.current.director(undefined, opinion)
      ternaryRef.current.point(undefined, opinion)
      
      //return () => {
      //  ternaryRef.current?.cleanup()
      //}
    }
  }, [])

  return (
    <div className='h-full grid grid-rows-2 lg:grid-rows-none lg:grid-cols-2'>
      <div ref={ternaryWrapRef}
        className='relative h-full w-full bg-primary shadow-inner-l dark:shadow-black/50'
      >
        <ul className='absolute right-2 top-2 p-2 rounded-md shadow'>
          <b>Opinion</b>
          <li><b>Belief: </b>{opinion.belief.toFixed(2)}</li>
          <li><b>Disbelief: </b>{opinion.disbelief.toFixed(2)}</li>
          <li><b>Uncertainty: </b>{opinion.uncertainty.toFixed(2)}</li>
          <li><b>Base rate: </b>{opinion.baseRate.toFixed(2)}</li>
          <li><b>Probability: </b>{opinion.probability.toFixed(2)}</li>
        </ul>
      </div>
      <DensityPlot data={opinion.distribution}/>
    </div>
  )
}

export default observer(OpinionPlot)