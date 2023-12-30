'use client'

import useResizeObserver, {Size} from 'hooks/useResizeObserver'
import {HTMLProps, useEffect, useRef, useState} from 'react'

type Props = {
  number: number
  symbol: string
  shells: number[]
} & HTMLProps<HTMLDivElement>

export default function BohrAtom({number, symbol, shells, ...props}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapSize = useResizeObserver(wrapRef)

  useEffect(() => {
    const svg = svgRef.current
    if (!(wrapRef.current && svg && wrapSize)) return

    const {width, height} = wrapSize
    svg.setAttribute('width', (width > height) ? 
      height.toString() : width.toString())

  }, [wrapSize])

  return (<div ref={wrapRef} {...props}>
    <svg ref={svgRef} viewBox='-11 -11 22 22'>
      <circle r='2' fill='rgb(var(--color-text))' fillOpacity='0.3'>
        <title>{`Bohr atom of ${symbol}`}</title>
      </circle>
      <text 
        fontSize='0.1rem' 
        fill='rgb(var(--color-text))' 
        textAnchor='middle' 
        dominantBaseline='central'
      >
        {symbol}
      </text>
      {shells.map((electrons, index) =>
        <g key={`g.${index}`}>
          <animateTransform
            attributeName='transform'
            type='rotate'
            from='0'
            to='360'
            dur={`${3*(index + 1)**1.5}s`}
            repeatCount='indefinite' 
          />
          <circle r={index + 3} fill='none' 
            className='stroke-text/30 hover:stroke-yellow-300'
            strokeWidth='0.2'>
            <title>{`Shell ${index + 1}: ${electrons} electrons`}</title>
          </circle>
          {[...Array(electrons).keys()].map((electron) => 
            <circle key={`circle.${electron}`}
              r='0.3' 
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
    </svg>
  </div>)
}