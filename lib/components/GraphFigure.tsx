import { parse as mathParse } from "mathjs"

import type { Axis } from "lib/components/SvgPlot"
import Vector from "lib/utils/vector"
import dynamic from "next/dynamic"

type Props = {
  expression: string
  points: number
  xAxis: Axis
  yAxis: Axis
  caption: string
}

const SVGPlot = dynamic(() => import("lib/components/SvgPlot"), {
  ssr: false,
})

export default function GraphFigure({
  expression,
  points,
  xAxis,
  yAxis,
  caption,
}: Props) {
  const lambda = mathParse(expression).compile()

  const x = Vector.linspace(
    xAxis.domain![0],
    xAxis.domain![1],
    points,
  ).toArray()

  const data = Array<[number, number]>(x.length)

  for (let i = 0; i < x.length; i++) {
    data[i] = [x[i], lambda.evaluate({ x: x[i] })]
  }

  return (
    <figure className="flex flex-col relative">
      <SVGPlot data={data} xAxis={xAxis} yAxis={yAxis} />
      <figcaption
        className="text-center before:font-bold before:[counter-increment:fig] 
        before:content-['Figure_'_counter(fig)_':_']"
      >
        {caption}
      </figcaption>
    </figure>
  )
}
