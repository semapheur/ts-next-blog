'use client'

import {SVGProps} from 'react'

type Props = {
  number: number
  symbol: string
  shells: number[]
} & SVGProps<SVGSVGElement>

export default function BohrAtom({number, symbol, shells, ...props}: Props) {

  return (
    <svg viewBox='-10 -10 20 20' {...props}>
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
        <g>
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
            strokeWidth='0.1'>
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