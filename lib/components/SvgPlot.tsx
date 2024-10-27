"use client"

import { type HTMLAttributes, useEffect, useRef } from "react"
import * as d3 from "d3"
import useResizeObserver from "lib/hooks/useResizeObserver"

type Margin = {
  top: number
  right: number
  bottom: number
  left: number
}

export type Axis = {
  scale: "linear" | "log"
  domain?: [number, number]
}

type Props = {
  data: Array<[number, number]>
  xAxis: Axis
  yAxis: Axis
} & HTMLAttributes<HTMLDivElement>

function createScale(scale: "linear" | "log") {
  if (scale === "linear") {
    return d3.scaleLinear()
  }

  if (scale === "log") {
    return d3.scaleLog()
  }
}

export default function SVGPlot({ data, xAxis, yAxis, ...props }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const size = useResizeObserver(wrapRef)

  useEffect(() => {
    if (!(svgRef.current && size)) return

    const margin: Margin = {
      top: 0.1 * size.height,
      right: 0.1 * size.width,
      bottom: 0.1 * size.height,
      left: 0.1 * size.width,
    }

    if (yAxis.domain === undefined) {
      const yMin = Math.min(...data.map((point) => point[1]))
      const yMax = Math.max(...data.map((point) => point[1]))
      yAxis.domain = [yMin, yMax]
    }

    if (xAxis.domain === undefined) {
      const xMin = Math.min(...data.map((point) => point[0]))
      const xMax = Math.max(...data.map((point) => point[0]))
      xAxis.domain = [xMin, xMax]
    }

    const plotWidth = size.width - (margin.left + margin.right)
    const plotHeight = size.height - (margin.top + margin.bottom)

    const svg = d3
      .select(svgRef.current)
      .attr("width", size.width)
      .attr("height", size.height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const xScale = createScale(xAxis.scale)!
      .domain(xAxis.domain)
      .range([0, plotWidth])

    svg
      .append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(plotWidth / 80))
      .call((g) => g.select(".domain").attr("stroke", "rgb(var(--color-text))"))
      .call((g) =>
        g.selectAll(".tick text").attr("fill", "rgb(var(--color-text))"),
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "rgb(var(--color-text))")
          .clone()
          .attr("y1", 0)
          .attr("y2", -plotHeight)
          .attr("stroke-opacity", 0.1),
      )

    const yScale = createScale(yAxis.scale)!
      .domain(yAxis.domain)
      .range([plotHeight, 0])

    // y-axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(plotHeight / 80))
      .call((g) => g.select(".domain").attr("stroke", "rgb(var(--color-text))"))
      .call((g) =>
        g.selectAll(".tick text").attr("fill", "rgb(var(--color-text))"),
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("stroke", "rgb(var(--color-text))")
          .clone()
          .attr("x1", 0)
          .attr("x2", plotWidth)
          .attr("stroke-opacity", 0.1),
      )

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d: [number, number]) => xScale(d[0]))
      .y((d: [number, number]) => yScale(d[1]))

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      //.attr('opacity', '.5')
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d", line)

    return () => {
      svg.selectAll("g").remove()
      svg.remove()
    }
  }, [size, data])

  return (
    <div ref={wrapRef} className={props.className}>
      <svg ref={svgRef} />
    </div>
  )
}
