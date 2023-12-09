'use client'

import {HTMLAttributes, useEffect, useRef} from 'react'
import * as d3 from 'd3'
import useResizeObserver from 'hooks/useResizeObserver'

type Size = {
  width: number
  height: number
}

type Margin = {
  top: number
  right: number
  bottom: number
  left: number
}

type Props = {
  data: Array<[number, number]>
} & HTMLAttributes<HTMLDivElement>

export default function DensityPlot({data, ...props}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const size = useResizeObserver(wrapRef)

  useEffect(() => {
    if (!svgRef.current || !size) return

    const margin: Margin = {
      top: 0.1 * size.height,
      right: 0.1 * size.width,
      bottom: 0.1 * size.height,
      left: 0.1 * size.width
    }

    const plotWidth = size.width - (margin.left + margin.right)
    const plotHeight = size.height - (margin.top + margin.bottom)

    const svg = d3.select(svgRef.current)
      .attr('width', size.width)
      .attr('height', size.height)
      .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    //svg.append('defs')
    //  .append('pattern')
    //    .attr('id', 'density-grid-pattern')
    //    .attr('width', plotWidth)
    //    .attr('height', plotHeight)
    //    .attr('patternUnits', 'userSpaceOnUse')
    //  .append('rect')
    //    .attr('width', 1/plotWidth)
    //    .attr('height', 10/plotHeight)
    //    .attr('fill', 'none')
    //    .attr('stroke', 'rgb(var(--color-text))')

    //svg.append('rect')
    //  .attr('width', plotWidth)
    //  .attr('height', plotHeight)
    //  .attr('fill', 'url(#density-grid-pattern)')

    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, plotWidth])

    svg.append('g')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale))

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([plotHeight, 0])
    
    // y-axis
    svg.append('g')
      .call(d3.axisLeft(yScale))

    svg.append('g')
      .call(d3.axisLeft(yScale))

    const line = d3.line()
      .curve(d3.curveBasis)
      .x((d: [number, number]) => xScale(d[0]))
      .y((d: [number, number]) => yScale(d[1]))

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      //.attr('opacity', '.5')
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    return () => {
      svg.selectAll('g').remove()
      svg.remove()
    }
  }, [size, data])

  return (
    <div ref={wrapRef} className={props.className}>
      <svg ref={svgRef}/>
    </div>
    
  )
}