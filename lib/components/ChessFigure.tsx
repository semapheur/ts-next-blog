"use client"
import { useEffect, useRef } from "react"
import { SVGChess } from "./SvgChess"

type Props = {
  fen: string
  caption: string
}

export default function ChessFigure({ fen, caption }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGChess | null>(null)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (wrapper && !svgRef.current) {
      svgRef.current = new SVGChess(wrapper)
      svgRef.current.boardPosition(fen)
    }
  }, [fen])

  return (
    <figure className="relative">
      <div ref={wrapRef} />
      <figcaption
        className="before:font-bold before:[counter-increment:fig] 
        before:content-['Figure_'_counter(fig)_':_']"
      >
        {caption}
      </figcaption>
    </figure>
  )
}
