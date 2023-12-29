'use client'

import {useEffect, useRef} from 'react'
import {block, For} from 'million/react' 

type Props = {
  symbol: string
  shells: number[]
}

export default function BohrAtom({symbol, shells}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  return (
    <svg ref={svgRef} viewBox='-10 -10 20 20'>
      <circle r='2' fill='rgb(var(--color-text))' fillOpacity='0.3'>
        <title>{`Bohr atom of ${symbol}`}</title>
      </circle>
      <text 
        fontSize='0.2rem' 
        fill='rgb(var(--color-text))' 
        textAnchor='middle' 
        dominantBaseline='central'
      >
        {symbol}
      </text>
      {shells.map((electrons, index) =>
        <g>
          <circle r={index + 3} fill='none' 
            className=''
            stroke='rgb(var(--color-text))' strokeOpacity='0.3' strokeWidth='0.1'>
            <title>{`Shell ${index + 1}: ${electrons} electrons`}</title>
          </circle>
          {[...Array(electrons).keys()].map((electron) => 
            <circle 
              r='0.2' 
              cx={(index + 3) * Math.cos(2 * Math.PI * electron/electrons)}
              cy={(index + 3) * Math.sin(2 * Math.PI * electron/electrons)}
              fill='rgb(var(--color-secondary))' 
              stroke='rgb(var(--color-text))'
              strokeWidth='0.1'
              strokeOpacity='0.7'
            />
          )}
        </g>
      )}
    </svg>)
}

// 