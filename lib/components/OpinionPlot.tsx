"use client"

import { useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"

import SVGTernaryPlot, { Opinion } from "lib/components/SvgTernary"
import SVGPlot from "lib/components/SvgPlot"

const initialState = {
  point: new DOMPoint(1 / 3, 1 / 3, 1 / 3),
  director: 0.5,
}

const opinion = new Opinion(initialState.point, initialState.director)

function OpinionPlot() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const ternaryPlot = useRef<SVGTernaryPlot | null>(null)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (!ternaryPlot.current && wrapper) {
      ternaryPlot.current = new SVGTernaryPlot(wrapper, initialState)
      ternaryPlot.current.grid()
      ternaryPlot.current.axis()
      ternaryPlot.current.director(undefined, opinion)
      ternaryPlot.current.point(undefined, opinion)

      //return () => {
      //  ternaryRef.current?.cleanup()
      //}
    }
  })

  return (
    <div className="h-full grid grid-rows-2 lg:grid-rows-none lg:grid-cols-2">
      <div
        ref={wrapRef}
        className="relative h-full w-full bg-primary shadow-inner-l dark:shadow-black/50"
      >
        <ul className="absolute right-2 top-2 p-2 rounded-md shadow-sm text-text">
          <b>Opinion</b>
          <li>
            <b>Belief: </b>
            {opinion.belief.toFixed(2)}
          </li>
          <li>
            <b>Disbelief: </b>
            {opinion.disbelief.toFixed(2)}
          </li>
          <li>
            <b>Uncertainty: </b>
            {opinion.uncertainty.toFixed(2)}
          </li>
          <li>
            <b>Base rate: </b>
            {opinion.baseRate.toFixed(2)}
          </li>
          <li>
            <b>Probability: </b>
            {opinion.probability.toFixed(2)}
          </li>
        </ul>
      </div>
      <SVGPlot
        data={opinion.distribution}
        xAxis={{ scale: "linear", domain: [0, 1] }}
        yAxis={{ scale: "linear" }}
      />
    </div>
  )
}

export default observer(OpinionPlot)
