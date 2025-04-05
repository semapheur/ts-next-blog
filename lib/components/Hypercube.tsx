"use client"

import { type HTMLAttributes, useEffect, useRef } from "react"
import Algebra from "ganja.js"

declare global {
  interface Window {
    dim: number
    wrapper: HTMLElement
    animationSpeed: number
  }
}

type Props = {
  dim: number
  animationSpeed?: number
} & HTMLAttributes<HTMLDivElement>

export default function Hypercube({
  dim,
  animationSpeed = 1e-3,
  ...props
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (!wrapper) return

    window.dim = dim
    window.wrapper = wrapper
    window.animationSpeed = animationSpeed

    Algebra(dim, 0, 1, () => {
      // Vertices
      const p = [...Array(2 ** dim)]
        .map((_, i) => i.toString(2).padStart(dim, "0"))
        .map((x) => x.split("").map((x) => Number.parseFloat(x) - 0.5))
        .map((x: Algebra) => !(1e0 + x * ([1e1, 1e2, 1e3, 1e4] as Algebra))) // Disable biome.js to preserve 1e0

      // Edges
      const e = p.flatMap((a, i) =>
        p.map((b, j) => (i <= j || (i ^ j) & (i ^ (j - 1)) ? 0 : [a, b])),
      )

      // State
      let state: [Algebra, Algebra] = [Math.E ** 0.1e12, 1e12 + 1.3e13 + 0.5e24]

      // Derivative
      const dS = ([M, B]: [Algebra, Algebra]): [Algebra, Algebra] => [
        -0.5 * M * B,
        -0.5 * ((B.Dual * B - B * B.Dual) as Algebra).UnDual,
      ]

      // Render
      const svg = this.graph(
        () => {
          for (let i = 0; i < 10; ++i) {
            // @ts-ignore
            state = state + animationSpeed * dS(state)
          }
          // @ts-ignore
          return [0xffffff, ...(state[0] >>> e)]
        },
        {
          lineWidth: 10,
          animate: 1,
          scale: 2,
        },
      )
      Object.assign(svg.style, {
        background: "none",
        width: "100%",
        height: "100%",
      })
      wrapper.appendChild(svg)
    })

    return () => {
      while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild)
      }
    }
  }, [dim, animationSpeed])

  return (
    <div ref={wrapRef} className={props?.className || "size-full"} {...props} />
  )
}
