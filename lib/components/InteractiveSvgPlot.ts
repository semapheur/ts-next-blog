//svgEl.transform.baseVal.initialize()

import { parse as mathParse } from "mathjs"
import { difference, intersection, gridUnit } from "lib/utils/num"

import Vector from "lib/utils/vector"
import {
  setAttributes,
  removeElementsByClass,
  addChildElement,
  mousePosition,
  setSvgTransform,
  screenToDrawPosition,
} from "lib/utils/svg"
import EventListenerStore from "lib/utils/event"

type SvgPlots = {
  [key: string]: {
    yBounds: number[]
    color: string
  }
}

export type ViewRange = {
  x: Vector
  y: Vector
}

export class InteractiveSVGPlot {
  private readonly xmlns = "http://www.w3.org/2000/svg"
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private frameGroup: SVGGElement
  private plotGroup: SVGGElement
  private viewRange: ViewRange = {
    x: new Vector(-10, 10),
    y: new Vector(-10, 10),
  }
  private gridSize = new Vector(1, 1)
  private minGridScreenSize = 50
  private plots: SvgPlots = {}
  private eventListeners = new EventListenerStore()
  private crosshairGroup: SVGGElement
  private gridGroup: SVGGElement
  private axisGroup: SVGGElement

  private onPointerMoveBound: (event: PointerEvent) => void
  private onPointerLeaveBound: () => void

  constructor(
    container: HTMLDivElement,
    margin?: Vector,
    width?: number,
    height?: number,
    viewBox?: string,
    viewRange?: ViewRange,
  ) {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()

    if (!width) width = rect.width
    if (!height) height = rect.height
    if (!viewBox) viewBox = `0 0 ${width} ${height}` // Viewbox matches viewport by default

    if (viewRange) this.viewRange = viewRange

    // Create SVG element
    this.svgElement = document.createElementNS(
      this.xmlns,
      "svg",
    ) as SVGSVGElement
    const svgAttr = {
      xmlns: this.xmlns,
      width: width.toString(),
      height: height.toString(),
      viewBox: viewBox,
    }

    setAttributes(this.svgElement, svgAttr)
    container.appendChild(this.svgElement)

    // Create defs element
    this.svgDefs = document.createElementNS(
      this.xmlns,
      "defs",
    ) as SVGDefsElement
    this.svgElement.appendChild(this.svgDefs)

    // Create group elements
    this.frameGroup = document.createElementNS(this.xmlns, "g") as SVGGElement
    if (margin) {
      this.setFrameTransform(margin, width, height)
    }
    this.svgElement.appendChild(this.frameGroup)

    this.plotGroup = document.createElementNS(this.xmlns, "g") as SVGGElement
    this.setViewTransform(width, height)
    this.frameGroup.appendChild(this.plotGroup)

    this.crosshairGroup = document.createElementNS(
      this.xmlns,
      "g",
    ) as SVGGElement
    this.frameGroup.appendChild(this.crosshairGroup)

    this.gridGroup = document.createElementNS(this.xmlns, "g") as SVGGElement
    this.frameGroup.appendChild(this.gridGroup)

    this.axisGroup = document.createElementNS(this.xmlns, "g") as SVGGElement
    this.frameGroup.appendChild(this.axisGroup)

    addChildElement(this.frameGroup, "g", { id: "crosshair-group" })
    addChildElement(this.frameGroup, "g", { id: "grid-group" })
    addChildElement(this.frameGroup, "g", { id: "axis-group" })

    this.onPointerMoveBound = this.onPointerMove.bind(this)
    this.onPointerLeaveBound = this.onPointerLeave.bind(this)

    // Add functionality
    this.crosshair()
    this.panOnDrag()
    this.zoomOnWheel()
    this.resizeOnDrag()
  }

  public cleanup() {
    this.eventListeners.cleanupEventListeners()
    // Remove svg
    //this.svgElement.parentNode?.removeChild(this.svgElement)
  }

  public resize(width: number, height: number) {
    const viewBox = `0 0 ${width} ${height}` // Viewbox matches viewport by default
    const attr = {
      width: width.toString(),
      height: height.toString(),
      viewBox: viewBox,
    }
    setAttributes(this.svgElement, attr)
    this.transformView()
  }

  private setFrameTransform(margin?: Vector, width?: number, height?: number) {
    let transform = this.frameGroup.getCTM()!

    if (!width) width = this.svgElement.getBoundingClientRect().width
    if (!height) height = this.svgElement.getBoundingClientRect().height
    if (!margin) {
      margin = new Vector((1 - transform.a) / 2, (1 - transform.d) / 2)
    }

    transform = new DOMMatrix([
      1 - 2 * margin.x,
      0,
      0,
      1 - 2 * margin.y,
      (1 - 2 * margin.x) * width * margin.x,
      (1 - 2 * margin.y) * height * margin.y,
    ])
    setSvgTransform(this.frameGroup, transform)
  }

  private setViewTransform(width?: number, height?: number) {
    const frameTransform = this.frameGroup.getCTM()!

    if (!width) width = this.svgElement.getBoundingClientRect().width
    if (!height) height = this.svgElement.getBoundingClientRect().height

    const viewLength = new Vector(
      this.viewRange.x.diff() as number,
      this.viewRange.y.diff() as number,
    )
    const transform = new DOMMatrix([
      (width * frameTransform.a) / viewLength.x,
      0,
      0,
      (height * frameTransform.d) / viewLength.y,
      width * frameTransform.a * (-this.viewRange.x[0] / viewLength.x),
      height * frameTransform.d * (-this.viewRange.y[0] / viewLength.y),
    ])
    setSvgTransform(this.plotGroup, transform)
  }

  private crosshair() {
    const onPointerEnterBound = this.onPointerEnter.bind(this)
    this.eventListeners.storeEventListener(
      "pointerenter",
      this.svgElement,
      onPointerEnterBound,
    )
  }

  private onPointerEnter() {
    if (!this.crosshairGroup) return

    // Text element displaying cursor position
    const attr = {
      id: "crosshair-text",
      "font-size": "0.75em",
      fill: "rgb(var(--color-text) / 1)",
    }
    addChildElement(this.crosshairGroup, "text", attr)

    // Crosshair lines
    const pathAttr = {
      d: "",
      stroke: "rgb(var(--color-text) / 1)",
      "stroke-width": "1px",
      "stroke-dasharray": "5px",
      opacity: "0.5",
      "vector-effect": "non-scaling-stroke",
    }
    addChildElement(this.crosshairGroup, "path", {
      ...pathAttr,
      id: "crosshair-line-x",
    })

    addChildElement(this.crosshairGroup, "path", {
      ...pathAttr,
      id: "crosshair-line-y",
    })

    this.frameGroup.addEventListener("pointermove", this.onPointerMoveBound)
    this.frameGroup.addEventListener("pointerleave", this.onPointerLeaveBound)
  }

  private onPointerMove(event: PointerEvent) {
    const text = document.getElementById("crosshair-text")
    const xLine = document.getElementById("crosshair-line-x")
    const yLine = document.getElementById("crosshair-line-y")
    if (!text || !xLine || !yLine) return

    const transform = this.plotGroup.getCTM()!
    const svgPos = mousePosition(this.frameGroup, event)
    if (!svgPos || !transform) return

    const drawPos = screenToDrawPosition(svgPos, transform)!

    const coordText = (coord: number, ix: number): string => {
      return this.gridSize[ix] < 0.01 || this.gridSize[ix] > 999
        ? coord.toExponential(2)
        : coord.toFixed(2)
    }

    text.setAttribute("x", `${svgPos.x + 15}`)
    text.setAttribute("y", `${svgPos.y + 20}`)
    text.textContent = `(${coordText(drawPos.x, 0)}, ${coordText(
      -drawPos.y,
      1,
    )})`

    xLine.setAttribute(
      "d",
      `M${svgPos.x},${transform.f}L${svgPos.x},${svgPos.y}`,
    )
    yLine.setAttribute(
      "d",
      `M${transform.e},${svgPos.y}L${svgPos.x},${svgPos.y}`,
    )
  }

  private onPointerLeave() {
    for (const i of ["text", "line-x", "line-y"]) {
      const el = document.getElementById(`crosshair-${i}`)
      el?.remove()
    }
    this.frameGroup.removeEventListener("pointermove", this.onPointerMoveBound)
    this.frameGroup.removeEventListener(
      "pointerleave",
      this.onPointerLeaveBound,
    )
  }

  private panOnDrag() {
    const dragButton = 1
    let startPos = new DOMPoint(0, 0)
    let isPanning = false

    const onClickBound = (event: PointerEvent) => {
      if (event.button !== dragButton) return
      event.preventDefault()

      // Click position
      const pos = mousePosition(this.frameGroup, event)
      if (!pos) return
      startPos = pos
      isPanning = true

      const onPointerMoveBound = (e: PointerEvent) => {
        if (!isPanning) return

        const transform = this.plotGroup.getCTM()!
        const panPos = mousePosition(this.frameGroup, e)
        if (!panPos) return

        const dist = {
          x: (startPos.x - panPos.x) / transform.a,
          y: (startPos.y - panPos.y) / transform.d,
        }

        this.viewRange.x.addScalarInplace(dist.x)
        this.viewRange.y.addScalarInplace(dist.y)

        this.transformView(true)

        startPos = panPos
      }

      const onPointerUpBound = () => {
        isPanning = false
        this.redrawPlots()

        // Clean up event listeners
        this.frameGroup.removeEventListener("pointermove", onPointerMoveBound)
        this.frameGroup.removeEventListener("pointerup", onPointerUpBound)
      }

      // Add temporary event listeners
      this.frameGroup.addEventListener("pointermove", onPointerMoveBound)
      this.frameGroup.addEventListener("pointerup", onPointerUpBound)
    }

    this.eventListeners.storeEventListener(
      "pointerdown",
      this.frameGroup,
      onClickBound,
    )
  }

  private zoomOnWheel() {
    const onWheelBound = (event: WheelEvent) => {
      const viewLength = new Vector(
        this.viewRange.x.diff() as number,
        this.viewRange.y.diff() as number,
      )
      const svgPos = mousePosition(this.frameGroup, event)
      if (!svgPos) return
      const transform = this.plotGroup.getCTM()!

      const drawPos = screenToDrawPosition(svgPos, transform)!

      // Calculate zoom deltas
      const zoomFactor = 0.05
      const dw = viewLength.x * Math.sign(-event.deltaY) * zoomFactor
      const dh = viewLength.y * Math.sign(-event.deltaY) * zoomFactor

      // Calculate position-based adjustments
      const dx = dw * ((drawPos.x - this.viewRange.x[0]) / viewLength.x)
      const dy = dh * ((drawPos.y - this.viewRange.y[0]) / viewLength.y)

      // Update view range
      this.viewRange.x[0] += dx
      this.viewRange.y[0] += dy
      this.viewRange.x[1] = this.viewRange.x[0] + (viewLength.x - dw)
      this.viewRange.y[1] = this.viewRange.y[0] + (viewLength.y - dh)

      this.transformView()
    }

    this.eventListeners.storeEventListener(
      "wheel",
      this.frameGroup,
      onWheelBound,
    )
  }

  private resizeOnDrag() {
    const dragButton = 0
    let dragged = false
    let dragPos: DOMPoint | null = null
    let clickPos: DOMPoint | null = null

    const onClickBound = (event: PointerEvent) => {
      if (event.button !== dragButton) return
      event.preventDefault()

      dragged = true

      // Click coordinates
      clickPos = mousePosition(this.frameGroup, event)
      if (!clickPos) {
        dragged = false
        return
      }

      // Create coverage rectangle
      const path = {
        id: "zoom-rect",
        fill: "rgb(var(--color-secondary))",
        opacity: "0.1",
      }
      addChildElement(this.frameGroup, "path", path)

      const onDragBound = (e: PointerEvent) => {
        if (!dragged || !clickPos) return

        dragPos = mousePosition(this.frameGroup, e)
        if (!dragPos) return

        const rect = document.getElementById("zoom-rect")
        if (!rect) return

        const d = `M${clickPos.x},${clickPos.y} L${dragPos.x},${clickPos.y} ${dragPos.x},${dragPos.y} ${clickPos.x},${dragPos.y}Z`
        rect.setAttribute("d", d)
      }

      const endDragBound = () => {
        dragged = false
        if (!clickPos || !dragPos) return

        const rect = document.getElementById("zoom-rect")
        if (rect) rect.remove()

        const transform = this.plotGroup.getCTM()!

        // Calculate new view range based on drag rectangle
        const svgTopLeft = new DOMPoint(
          Math.min(clickPos.x, dragPos.x),
          Math.min(clickPos.y, dragPos.y),
        )
        const topLeft = screenToDrawPosition(svgTopLeft, transform)

        const svgBottomRight = new DOMPoint(
          Math.max(clickPos.x, dragPos.x),
          Math.max(clickPos.y, dragPos.y),
        )
        const bottomRight = screenToDrawPosition(svgBottomRight, transform)

        // Only update if we have valid coordinates and a meaningful drag distance
        if (
          topLeft &&
          bottomRight &&
          Math.abs(dragPos.x - clickPos.x) > 10 &&
          Math.abs(dragPos.y - clickPos.y) > 10
        ) {
          this.viewRange = {
            x: new Vector(topLeft.x, bottomRight.x),
            y: new Vector(topLeft.y, bottomRight.y),
          }
          this.transformView()
        }

        // Cleanup event handlers
        this.frameGroup.removeEventListener("pointermove", onDragBound)
        this.frameGroup.removeEventListener("pointerup", endDragBound)
      }

      // Add temporary event listeners
      this.frameGroup.addEventListener("pointermove", onDragBound)
      this.frameGroup.addEventListener("pointerup", endDragBound)
    }

    this.eventListeners.storeEventListener(
      "pointerdown",
      this.frameGroup,
      onClickBound,
    )
  }

  public fitViewToPlots(fn?: string, offset = 0.1): void {
    let yMin = Number.POSITIVE_INFINITY
    let yMax = Number.NEGATIVE_INFINITY

    if (fn && this.plots[fn]) {
      yMin = this.plots[fn].yBounds[0]
      yMax = this.plots[fn].yBounds[1]
    } else {
      // Find min/max y bounds across all plots
      for (const plotFn in this.plots) {
        const bounds = this.plots[plotFn].yBounds
        if (bounds[0] < yMin) yMin = bounds[0]
        if (bounds[1] > yMax) yMax = bounds[1]
      }

      // If no plots, use current view range
      if (
        yMin === Number.POSITIVE_INFINITY ||
        yMax === Number.NEGATIVE_INFINITY
      ) {
        yMin = this.viewRange.y[0]
        yMax = this.viewRange.y[1]
      }
    }

    // Apply offset and update view range
    const newViewRange = {
      x: new Vector(this.viewRange.x[0], this.viewRange.x[1]),
      y: new Vector(yMin - offset, yMax + offset),
    }

    this.viewRange = newViewRange
    this.transformView()
  }

  private transformView(pan = false) {
    this.setFrameTransform()
    this.setViewTransform()

    this.transformGrid()
    this.transformAxis()

    if (!pan) {
      this.redrawPlots()
    }
  }

  private ticks(redraw = false) {
    const transform = this.plotGroup.getCTM()!

    const svgSize = {
      x: this.svgElement.getBoundingClientRect().width,
      y: this.svgElement.getBoundingClientRect().height,
    }

    const clamp = (key: string) => {
      const axisOffset = { x: -30, y: 15 }
      const minOffset = { x: 10, y: 15 }
      const maxOffset = { x: 30, y: 10 }

      const translate = key === "x" ? transform.e : transform.f

      if (translate < 0) return `${minOffset[key]}`

      if (translate > svgSize[key]) return `${svgSize[key] - maxOffset[key]}`

      return `${translate + axisOffset[key]}`
    }

    const tickFormat = (tick: number, index: number): string => {
      if (tick === 0) return "0"

      const gridSize = this.gridSize[index]

      if (index === 1) {
        tick *= -1
      }
      if (gridSize > 999) {
        return tick.toExponential(0)
      }
      if (gridSize < 0.01) {
        return tick.toExponential(3)
      }
      if (gridSize < 0.1) {
        return tick.toFixed(2)
      }
      if (gridSize < 1) {
        return tick.toFixed(1)
      }
      return tick.toFixed(0)
    }

    const createTicks = (index: number, key: "x" | "y") => {
      const perp = key === "x" ? "y" : "x"
      const step = this.gridSize[index]
      const scale = index === 0 ? transform.a : transform.d
      const translate = index === 0 ? transform.e : transform.f

      let tick = index === 0 ? this.viewRange.x[0] : this.viewRange.y[0]
      if (tick % step !== 0) {
        tick += tick < 0 ? -tick % step : step - (tick % step)
      }
      let screenPos = tick * scale + translate

      while (screenPos < svgSize[key]) {
        if (tick === 0) {
          tick += step
          screenPos += step * scale
          continue
        }
        const attr = {
          class: "tick-text",
          "font-size": "0.75rem",
          fill: "rgb(var(--color-text) / 1)",
        }
        attr[`${key}`] = String(screenPos)
        attr[`${perp}`] = clamp(perp)
        const text = document.createElementNS(this.xmlns, "text")
        setAttributes(text, attr)
        this.axisGroup.appendChild(text)
        text.textContent = tickFormat(tick, index)

        tick += step
        screenPos += step * scale
      }
    }

    if (redraw) {
      removeElementsByClass(this.axisGroup, "tick-text")
    }

    createTicks(0, "x")
    createTicks(1, "y")
  }

  public axes() {
    // Pattern
    const attr = {
      id: "axis-pattern",
      patternUnits: "userSpaceOnUse",
      width: "100%",
      height: "100%",
    }
    const pattern = document.createElementNS(this.xmlns, "pattern")
    setAttributes(pattern, attr)

    const transform = this.plotGroup.getCTM()!

    // x axis
    addChildElement(pattern, "line", {
      class: "x-axis",
      x1: "0",
      y1: `${transform.f}`,
      x2: "100%",
      y2: `${transform.f}`,
      stroke: "rgb(var(--color-text) / 1)",
      "stroke-width": "0.3",
    })

    // y axis
    addChildElement(pattern, "line", {
      class: "y-axis",
      x1: `${transform.e}`,
      y1: "0",
      x2: `${transform.e}`,
      y2: "100%",
      stroke: "rgb(var(--color-text) / 1)",
      "stroke-width": "0.3",
    })

    this.svgDefs.appendChild(pattern)

    // Axis rectangle
    const axis = document.getElementById("axis-group")!
    addChildElement(this.axisGroup, "rect", {
      class: "axis-rect",
      width: "100%",
      height: "100%",
      fill: "url(#axis-pattern)",
      "vector-effect": "non-scaling-stroke",
    })

    // Ticks
    this.ticks()
  }

  private transformAxis() {
    const pattern = document.getElementById("axis-pattern")
    if (!pattern) return

    const transform = this.plotGroup.getCTM()!

    // x axis
    const xAxis = pattern.getElementsByClassName("x-axis")[0]
    setAttributes(xAxis, { y1: `${transform.f}`, y2: `${transform.f}` })

    // y axis
    const yAxis = pattern.getElementsByClassName("y-axis")[0]
    setAttributes(yAxis, {
      x1: `${transform.e}`,
      x2: `${transform.e}`,
    })

    // Ticks
    this.ticks(true)
  }

  public grid() {
    const transform = this.plotGroup.getCTM()!

    const min = [
      this.minGridScreenSize / transform.a,
      this.minGridScreenSize / transform.d,
    ]
    this.gridSize = new Vector(gridUnit(min[0]), gridUnit(min[1]))

    // Pattern
    const pattern = document.createElementNS(this.xmlns, "pattern")
    setAttributes(pattern, {
      id: "grid-pattern",
      patternUnits: "userSpaceOnUse",
      patternTransform: DOMMatrix.fromMatrix(transform).toString(),
      width: `${this.gridSize.x}`,
      height: `${this.gridSize.y}`,
    })

    // Horizontal grid line
    addChildElement(pattern, "line", {
      class: "y-grid",
      x1: "0",
      y1: "0",
      x2: `${this.gridSize.x}`,
      y2: "0",
      stroke: "rgb(var(--color-text) / 0.2)",
      "stroke-width": `${1 / transform.d}`,
    })

    // Vertical grid line
    addChildElement(pattern, "line", {
      class: "x-grid",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: `${this.gridSize.y}`,
      stroke: "rgb(var(--color-text) / 0.2)",
      "stroke-width": `${1 / transform.a}`,
    })

    this.svgDefs.appendChild(pattern)

    // Grid rectangle
    addChildElement(this.gridGroup, "rect", {
      class: "grid-rect",
      width: "100%",
      height: "100%",
      fill: "url(#grid-pattern)",
      "vector-effect": "non-scaling-stroke",
    })
  }

  public transformGrid() {
    const pattern = document.getElementById("grid-pattern")!
    const transform = this.plotGroup.getCTM()!

    const min = [
      this.minGridScreenSize / transform.a,
      this.minGridScreenSize / transform.d,
    ]
    this.gridSize = new Vector(gridUnit(min[0]), gridUnit(min[1]))

    setAttributes(pattern, {
      patternTransform: DOMMatrix.fromMatrix(transform).toString(),
      width: `${this.gridSize.x}`,
      height: `${this.gridSize.y}`,
    })

    // Horizontal grid line
    const horizontalLine = pattern.getElementsByClassName("y-grid")[0]
    setAttributes(horizontalLine, {
      x2: `${this.gridSize.x}`,
      "stroke-width": `${1 / transform.d}`,
    })

    // Vertical grid line
    const verticalLine = pattern.getElementsByClassName("x-grid")[0]
    setAttributes(verticalLine, {
      y2: `${this.gridSize.y}`,
      "stroke-width": `${1 / transform.a}`,
    })
  }

  public innerShadow() {
    const filter = document.createElementNS(
      this.xmlns,
      "filter",
    ) as SVGFilterElement
    setAttributes(filter, { id: "inset-shadow-sm" })

    // Shadow offset
    const feOffset = document.createElementNS(
      this.xmlns,
      "feOffset",
    ) as SVGFEOffsetElement
    setAttributes(feOffset, { dx: "0", dy: "0" })
    filter.appendChild(feOffset)

    // Shadow blur
    const feBlur = document.createElementNS(
      this.xmlns,
      "feGaussianBlur",
    ) as SVGFEGaussianBlurElement
    setAttributes(feBlur, { stdDeviation: "1", result: "offset-blur" })
    filter.appendChild(feBlur)

    // Invert drop shadow to make inset shadow
    const feComposite1 = document.createElementNS(
      this.xmlns,
      "feComposite",
    ) as SVGFECompositeElement
    setAttributes(feComposite1, {
      operator: "out",
      in: "SourceGraphic",
      in2: "offset-blur",
      result: "inverse",
    })
    filter.appendChild(feComposite1)

    // Cur colour inside shadow
    const feFlood = document.createElementNS(
      this.xmlns,
      "feFlood",
    ) as SVGFEFloodElement
    setAttributes(feFlood, {
      "flood-color": "black",
      "flood-opacity": "1",
      result: "color",
    })
    filter.appendChild(feFlood)

    const feComposite2 = document.createElementNS(
      this.xmlns,
      "feComposite",
    ) as SVGFECompositeElement
    setAttributes(feComposite2, {
      operator: "in",
      in: "color",
      in2: "inverse",
      result: "shadow-sm",
    })
    filter.appendChild(feComposite2)

    // Place shadow over element
    const feComposite3 = document.createElementNS(
      this.xmlns,
      "feComposite",
    ) as SVGFECompositeElement
    setAttributes(feComposite3, {
      operator: "over",
      in: "shadow-sm",
      in2: "ShadowGraphic",
    })
    filter.appendChild(feComposite3)

    this.svgDefs.appendChild(filter)
  }

  public plot(fn: string, color = "red", redraw = false, points?: number) {
    // Check if the same function has been plotted already
    if (!redraw && fn in this.plots) {
      console.warn(`Function already plotted: ${fn}`)
      return null
    }
    const lambda = mathParse(fn).compile()
    if (!lambda) {
      console.error(`Invalid function of x: ${fn}`)
      return null
    }

    const viewWidth = this.viewRange.x.diff() as number

    if (!points) {
      points = Number.parseInt(this.svgElement.getAttribute("width")!)
    }

    const domain = Vector.linspace(
      this.viewRange.x[0] - viewWidth,
      this.viewRange.x[1] + viewWidth,
      points * 3,
    ).toArray()

    const path: string[] = Array(domain.length).fill("")

    const y = -lambda.evaluate({ x: domain[0] })
    path[0] = `M${domain[0]},${y}`

    let yMin = y
    let yMax = y
    for (let i = 1; i < domain.length; i++) {
      const y = -lambda.evaluate({ x: domain[i] })

      if (!Number.isFinite(y)) {
        // Add a move command to handle discontinuities
        if (i < domain.length - 1) {
          const nextValidY = -lambda.evaluate({ x: domain[i + 1] })
          if (Number.isFinite(nextValidY)) {
            path.push(`M${domain[i + 1]},${nextValidY}`)
            i++ // Skip to the next point as we've already used it
          }
        }
        continue
      }

      // Update y bounds
      yMin = Math.min(yMin, y)
      yMax = Math.max(yMax, y)

      if (path[path.length - 1].startsWith("M")) {
        // Add line segment or start new path segment
        path.push(`L${domain[i]},${y}`)
      } else {
        path.push(`${domain[i]},${y}`)
      }
    }
    path[1] = `L${path[1]}`

    const attr = {
      id: fn,
      class: "plot-path",
      d: path.join(" "),
      fill: "none",
      stroke: color,
      "stroke-width": "2px",
      "vector-effect": "non-scaling-stroke",
      //'stroke-width': `${1/((this.transform[0] + this.transform[3])/2)}`
    }
    addChildElement(this.plotGroup, "path", attr)

    this.plots[fn] = {
      yBounds: [yMin, yMax],
      color: color,
    }
  }

  public deletePlot(fn: string) {
    if (fn in this.plots) {
      const path = document.getElementById(fn)
      if (!path) return
      path.parentNode?.removeChild(path)
      delete this.plots[fn]
    }
  }

  public changeColor(fn: string, color: string) {
    if (fn in this.plots) {
      const path = document.getElementById(fn)
      if (!path) return
      path.setAttribute("stroke", color)
      this.plots[fn].color = color
    }
  }

  public listPlots(): string[] {
    return Object.keys(this.plots)
  }

  public updatePlots(plots: { [fn: string]: { color: string } }) {
    const oldFns = new Set(Object.keys(this.plots))
    const newFns = new Set(Object.keys(plots))

    const delFns = difference(oldFns, newFns)
    for (const fn of delFns) {
      this.deletePlot(fn)
    }

    const addFns = difference(newFns, oldFns)
    for (const fn of addFns) {
      this.plot(fn, plots[fn].color)
    }

    const changeFns = intersection(oldFns, newFns)
    for (const fn of changeFns) {
      this.changeColor(fn, plots[fn].color)
    }
  }

  private redrawPlots() {
    for (const fn in this.plots) {
      const yBounds = this.plots[fn].yBounds
      const redraw = !(
        this.viewRange.y[0] > yBounds[1] || this.viewRange.y[1] < yBounds[0]
      )
      if (redraw) {
        const path = document.getElementById(fn)
        if (!path) return
        path.parentNode?.removeChild(path)
        const clr = this.plots[fn].color
        this.plot(fn, clr, true)
      }
    }
  }
}
