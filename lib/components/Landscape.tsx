"use client"

import useResizeObserver from "lib/hooks/useResizeObserver"
import { useEffect, useRef } from "react"
import { drawHill, ValueNoise } from "lib/utils/noise"
import { brownianBridge } from "lib/utils/random"
import { svgCatmullRom } from "lib/utils/svg"
import Vector, { Curve } from "lib/utils/vector"

const colorMatrix = ["0 0 0 9 -4", "0 0 0 9 -4", "0 0 0 9 -4", "0 0 0 0 1"]

const valNoise = new ValueNoise(2011, 256)

function drawMountain(
  wayPoints: Curve,
  numPoints: number[],
  amplitude: number[],
): Curve {
  const result: Vector[] = []

  for (let i = 0; i < wayPoints.length - 1; i++) {
    const segment = brownianBridge(
      wayPoints[i],
      wayPoints[i + 1],
      numPoints[i],
      amplitude[i],
    )
    if (i < wayPoints.length - 2) {
      segment.pop()
    }
    result.push(...segment)
  }
  return new Curve(...result)
}

export default function Landscape() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const hill1Ref = useRef<SVGPathElement>(null)
  const hill2Ref = useRef<SVGPathElement>(null)
  const hill3Ref = useRef<SVGPathElement>(null)
  const hill4Ref = useRef<SVGPathElement>(null)
  const hill5Ref = useRef<SVGPathElement>(null)

  const size = useResizeObserver(wrapRef)

  useEffect(() => {
    if (
      !(
        size &&
        hill1Ref.current &&
        hill2Ref.current &&
        hill3Ref.current &&
        hill4Ref.current &&
        hill5Ref.current
      )
    )
      return

    const { height: h, width: w } = size

    const hill1 = hill1Ref.current
    const hill2 = hill2Ref.current
    const hill3 = hill3Ref.current
    const hill4 = hill4Ref.current
    const hill5 = hill5Ref.current

    // Hill 1
    let wp = new Curve(
      new Vector(0, 0.8 * h),
      new Vector(0.5 * w, 0.9 * h),
      new Vector(w, 0.8 * h),
    )
    let hill = drawHill(
      wp,
      valNoise,
      [5, 5],
      [0.03 * h, 0.03 * h],
      [10, 10],
      [0, 0],
      [1, 1],
    )
    let d = `${svgCatmullRom(hill, 0.7)}L${w},${h}L0,${h}Z`
    hill1.setAttribute("d", d)

    // Hill 2
    wp = new Curve(
      new Vector(0, 0.5 * h),
      new Vector(0.1 * w, 0.6 * h),
      new Vector(0.5 * w, 0.85 * h),
      new Vector(0.9 * w, 0.6 * h),
      new Vector(w, 0.5 * h),
    )
    let sparse = Math.ceil(w / 64)
    let dense = sparse * 2
    hill = drawMountain(wp, [sparse, dense, dense, sparse], [1, 2, 2, 1])
    d = `${svgCatmullRom(hill, 0.7)}L${w},${h}L0,${h}Z`
    hill2.setAttribute("d", d)

    // Hill 3
    wp = new Curve(
      new Vector(0, 0.6 * h),
      new Vector(0.2 * w, 0.6 * h),
      new Vector(0.5 * w, 0.8 * h),
      new Vector(0.8 * w, 0.6 * h),
      new Vector(w, 0.5 * h),
    )
    sparse = Math.ceil(w / 128)
    dense = sparse * 2
    hill = drawMountain(wp, [sparse, dense, dense, sparse], [1, 3, 3, 1])
    d = `${svgCatmullRom(hill, 0.7)}L${w},${h}L0,${h}Z`
    hill3.setAttribute("d", d)

    // Hill 4
    wp = new Curve(
      new Vector(0, 0.4 * h),
      new Vector(0.1 * w, 0.5 * h),
      new Vector(0.5 * w, 0.75 * h),
      new Vector(0.9 * w, 0.5 * h),
      new Vector(w, 0.4 * h),
    )
    sparse = Math.ceil(w / 256)
    dense = sparse * 2
    hill = drawMountain(wp, [sparse, dense, dense, sparse], [3, 3, 3, 3])
    d = `${svgCatmullRom(hill, 0.7)}L${w},${h}L0,${h}Z`
    hill4.setAttribute("d", d)

    // Hill 5
    wp = new Curve(
      new Vector(0, 0.7 * h),
      new Vector(0.3 * w, 0.7 * h),
      new Vector(0.5 * w, 0.5 * h),
      new Vector(0.7 * w, 0.7 * h),
      new Vector(w, 0.7 * h),
    )
    sparse = Math.ceil(w / 128)
    dense = sparse * 8
    hill = drawMountain(wp, [sparse, dense, dense, sparse], [1, 1, 1, 1])
    d = `${svgCatmullRom(hill, 0.7)}L${w},${h}L0,${h}Z`
    hill5.setAttribute("d", d)
  }, [size])

  return (
    <div ref={wrapRef} className="transform-style-3d relative z-[-1] h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="translate-z-[-5px] size-full origin-bottom-left scale-[6]"
      >
        <title>{"Landscape"}</title>
        <defs>
          <filter id="starsky">
            <feTurbulence baseFrequency=".2" />
            <feColorMatrix values={colorMatrix.join("  ")} />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#starsky)" />
      </svg>
      <div className="translate-z-[-5px] absolute inset-0 size-full origin-bottom-left scale-[6] bg-[linear-gradient(rgb(0,11,22,0.1)40%,rgb(13,98,245,1)80%,rgb(57,167,255,1)100%)] opacity-0 transition-opacity delay-[2s] duration-1000 dark:opacity-100" />
      <div className="translate-z-[-5px] absolute inset-0 size-full origin-bottom-left scale-[6] bg-[length:100%_200%] bg-[radial-gradient(circle_at_50%_60%,rgb(242,248,247,1)0%,rgb(249,249,28,1)3%,rgb(247,214,46,1)8%,rgb(248,200,95,1)12%,rgb(201,165,132,1)30%,rgb(115,130,133,1)51%,rgb(46,97,122,1)85%,rgb(24,75,106,1)100%)] bg-bottom [transition:opacity_2s_ease-in,background-position_1s_ease-out] dark:bg-top dark:opacity-0" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="translate-z-[-4px] absolute inset-0 size-full origin-bottom-left scale-[5]"
      >
        <title>{"Mountain"}</title>
        <path ref={hill5Ref} className="fill-amber-900 dark:fill-stone-200" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="translate-z-[-3px] absolute inset-0 size-full origin-bottom-left scale-[4]"
      >
        <title>{"Rolling hills"}</title>
        <path ref={hill4Ref} className="fill-amber-700 dark:fill-stone-300" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="translate-z-[-2px] absolute inset-0 size-full origin-bottom-left scale-[3]"
      >
        <title>{"Rolling hills"}</title>
        <path ref={hill3Ref} className="fill-amber-500 dark:fill-stone-400" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="translate-z-[-1px] absolute inset-0 size-full origin-bottom-left scale-[2]"
      >
        <title>{"Rolling hills"}</title>
        <path ref={hill2Ref} className="fill-amber-300 dark:fill-stone-500" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 size-full"
      >
        <title>{"Rolling hills"}</title>
        <path ref={hill1Ref} className="fill-amber-100 dark:fill-stone-600" />
      </svg>
    </div>
  )
}
