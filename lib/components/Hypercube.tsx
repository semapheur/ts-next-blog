"use client"

import { type HTMLAttributes, useEffect, useRef } from "react"
import Algebra from "ganja.js"

declare global {
  interface Window {
    dim?: number
    wrapper?: HTMLElement
    animationSpeed?: number
  }
}

type Props = {
  dim: number
  animationSpeed: number
} & HTMLAttributes<HTMLDivElement>

export default function Hypercube({ dim, animationSpeed, ...props }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  //const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    const wrapper = wrapRef.current
    if (
      !wrapper ||
      typeof window === "undefined" ||
      typeof animationSpeed === "undefined"
    )
      return

    window.dim = dim
    window.wrapper = wrapper
    window.animationSpeed = animationSpeed

    Algebra(dim, 0, 1, () => {
      // Basis
      const basis = Array.from({ length: dim + 1 }, (_, i) =>
        this.Coeff(i + 1, 1),
      )

      // Vertices
      const p = [...Array(2 ** dim)]
        .map((_, i) => i.toString(2).padStart(dim, "0"))
        .map((x) => x.split("").map((x) => Number.parseFloat(x) - 0.5))
        .map((x: any) => !(basis[0] + x * (basis.slice(1) as any)))

      // Edges
      const e = p.flatMap((a, i) =>
        p.map((b, j) => (i <= j || (i ^ j) & (i ^ (j - 1)) ? 0 : [a, b])),
      )

      // State
      let state: any = [0.1e12, 1e12 + 1.3e13 + 0.5e24]

      // Derivative
      const dS = ([M, B]) => [
        -0.5 * M * B,
        -0.5 * ((B.Dual * B - B * B.Dual) as any).UnDual,
      ]

      // Render
      const svg = this.graph(
        () => {
          for (let i = 0; i < 10; ++i) {
            state = state + animationSpeed * (dS(state) as any)
          }
          return [0xffffff, ...((state[0] >>> (e as any)) as any)]
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
      window.dim = undefined
      window.animationSpeed = undefined
      window.wrapper = undefined
    }
  }, [dim, animationSpeed])

  return (
    <div ref={wrapRef} className={props?.className || "size-full"} {...props} />
  )
}
