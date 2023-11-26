//svgEl.transform.baseVal.initialize()

import {parse as mathParse} from 'mathjs'
import { difference, intersection, intervalLength } from 'utils/num'

import Vector from 'utils/vector'
import { 
  setAttributes, 
  removeElementsByClass, 
  addChildElement, 
  mousePosition, 
  setSvgTransform, 
  screenToDrawPosition
} from 'utils/svg'
import EventListenerStore from 'utils/event'

type SvgPlots = {
  [key: string] : {
    yBounds: number[],
    color: string,
  }
}

export type ViewRange = {
  x: Vector,
  y: Vector
}

export class SVGPlot {
  private xmlns: string = 'http://www.w3.org/2000/svg'
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private frameGroup: SVGGElement
  private plotGroup: SVGGElement
  private viewRange: ViewRange = {
    x: new Vector(-10, 10),
    y: new Vector(-10, 10)
  }
  private gridSize = new Vector(1, 1)
  private minGridScreenSize = 50
  private plots: SvgPlots = {}
  private eventListeners = new EventListenerStore()

  constructor(
    container: HTMLDivElement,
    margin?: Vector,
    width?: number, 
    height?: number, 
    viewBox?: string, 
    viewRange?: ViewRange) 
  {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    
    if (!width) width = rect.width
    if (!height) height = rect.height
    if (!viewBox) viewBox = `0 0 ${width} ${height}` // Viewbox matches viewport by default
    
    if (viewRange) this.viewRange = viewRange
    
    // Create SVG element
    this.svgElement = document.createElementNS(this.xmlns, 'svg') as SVGSVGElement
    const svgAttr = {
      xmlns: this.xmlns,
      width: width.toString(),
      height: height.toString(),
      viewBox: viewBox,
    }
    
    setAttributes(this.svgElement, svgAttr)
    container.appendChild(this.svgElement)

    // Create defs element
    this.svgDefs = document.createElementNS(this.xmlns, 'defs') as SVGDefsElement
    this.svgElement.appendChild(this.svgDefs)

    // Create group elements
    this.frameGroup = document.createElementNS(this.xmlns, 'g') as SVGGElement
    if (margin) {
      this.setFrameTransform(margin, width, height)
    }
    this.svgElement.appendChild(this.frameGroup)
    
    this.plotGroup = document.createElementNS(this.xmlns, 'g') as SVGGElement
    this.setViewTransform(width, height)
    this.frameGroup.appendChild(this.plotGroup)
    
    addChildElement(this.frameGroup, 'g', {id: 'crosshair-group'})
    addChildElement(this.frameGroup, 'g', {id: 'grid-group'})
    addChildElement(this.frameGroup, 'g', {id: 'axis-group'})

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

    if (!width) width = this.svgElement.getBoundingClientRect().width // svgElement.height.baseVal.value
    if (!height) height = this.svgElement.getBoundingClientRect().height // svgElement.height.baseVal.value
    if (!margin) {
      margin = new Vector(
        (1 - transform.a) / 2,
        (1 - transform.d) / 2
      )
    }

    transform = new DOMMatrix([
      1 - 2 * margin.x, 
      0, 0, 
      1 - 2 * margin.y,
      (1 - 2 * margin.x) * width * margin.x,
      (1 - 2 * margin.y) * height * margin.y
    ])
    setSvgTransform(this.frameGroup, transform)
  }

  private setViewTransform(width?: number, height?: number) {
    const frameTransform = this.frameGroup.getCTM()
    if (!frameTransform) return

    if (!width) width = this.svgElement.getBoundingClientRect().width
    if (!height) height = this.svgElement.getBoundingClientRect().height

    const viewLength = new Vector(
      this.viewRange.x.diff() as number, 
      this.viewRange.y.diff() as number
    )
    const transform = new DOMMatrix([
      (width * frameTransform.a) / viewLength.x,
      0, 0,
      (height * frameTransform.d) / viewLength.y,
      (width * frameTransform.a) * (-this.viewRange.x[0] / viewLength.x),
      (height * frameTransform.d) * (-this.viewRange.y[0] / viewLength.y),
    ])
    console.log(transform)
    setSvgTransform(this.plotGroup, transform)
  }

  private crosshair() {
    const crosshairGroup = document.getElementById('crosshair-group')!

    const onMouseEnterBound = onMouseEnter.bind(this)
    this.eventListeners.storeEventListener('mouseenter', this.svgElement, onMouseEnterBound)
    
    function onMouseEnter() {
      // Text element displaying cursor position
      const attr = {
        id: 'crosshair-text',
        'font-size': '0.75em',
        fill: 'rgba(var(--color-text) / 1)'
      }
      addChildElement(crosshairGroup, 'text', attr)

      // Crosshair lines
      let path = {
        id: 'crosshair-line-x', d: '',
        stroke: 'rgba(var(--color-text) / 1)', 'stroke-width': '1px', 'stroke-dasharray': '5px',
        opacity: '0.5', 'vector-effect': 'non-scaling-stroke',
      }
      addChildElement(crosshairGroup, 'path', path)

      path['id'] = 'crosshair-line-y'
      addChildElement(crosshairGroup, 'path', path)

      this.frameGroup.addEventListener('mousemove', onMouseMove.bind(this))
      this.frameGroup.addEventListener('mouseleave', onMouseLeave.bind(this))
    }

    function onMouseMove(event: MouseEvent) {
      const coordText = (coord: number, ix: number): string => {
        if (this.gridSize[ix] < 0.01 || this.gridSize[ix] > 999) {
          return coord.toExponential(2)
        }
        return coord.toFixed(2)
      }

      const transform = this.plotGroup.getCTM()!
      const svgPos = mousePosition(this.frameGroup, event)
      if (!svgPos || !transform) return
      const drawPos = screenToDrawPosition(svgPos, transform)!
      
      const text = document.getElementById('crosshair-text')!
      text.setAttribute('x', `${svgPos.x + 15}`)
      text.setAttribute('y', `${svgPos.y + 20}`)
      
      text.innerHTML = `(${coordText(drawPos.x, 0)}, ${coordText(-drawPos.y, 1)})`

      const xLine = document.getElementById('crosshair-line-x')!
      xLine.setAttribute('d', `M${svgPos.x},${transform.f}L${svgPos.x},${svgPos.y}`)

      const yLine = document.getElementById('crosshair-line-y')!
      yLine.setAttribute('d', `M${transform.e},${svgPos.y}L${svgPos.x},${svgPos.y}`)
    }
    
    function onMouseLeave() {
      for (const i of ['text', 'line-x', 'line-y']) {
        const el = document.getElementById(`crosshair-${i}`)
        el?.remove()
      }
      this.frameGroup.removeEventListener('mousemove', onMouseMove.bind(this))
      this.frameGroup.removeEventListener('mouseleave', onMouseLeave.bind(this))
    }
  }

  private panOnDrag() {
    const dragButton = 1

    let startPos = new DOMPoint(0,0)
    let isPanning = false

    const onClickBound = onClick.bind(this)
    this.eventListeners.storeEventListener('mousedown', this.frameGroup, onClickBound)

    function onClick(event: MouseEvent) {
      if (event.button !== dragButton) return

      event.preventDefault()
      
      // Click position
      startPos = mousePosition(this.frameGroup, event)!
      isPanning = true

      this.frameGroup.addEventListener('mouseup', onMouseUp.bind(this))
      this.frameGroup.addEventListener('mousemove', onMouseMove.bind(this))
    }

    function onMouseMove(event: MouseEvent) {
      if (!isPanning) return
      
      const transform = this.plotGroup.getCTM()
      const panPos = mousePosition(this.frameGroup, event)!

      const dist = {
        x: (startPos.x - panPos.x) / transform.a,
        y: (startPos.y - panPos.y) / transform.d
      }

      this.viewRange.x.addScalarInplace(dist.x)
      this.viewRange.y.addScalarInplace(dist.y)

      this.transformView(true)

      startPos = mousePosition(this.frameGroup, event)!
    }

    function onMouseUp() {
      isPanning = false
      this.redrawPlots()
      this.frameGroup.removeEventListener('mousemove', onMouseMove.bind(this))
      this.frameGroup.removeEventListener('mouseup', onMouseUp.bind(this))
    }
  }

  private zoomOnWheel() {
    //const zoomStep = 1

    const onWheelBound = onWheel.bind(this)
    this.eventListeners.storeEventListener('wheel', this.frameGroup, onWheelBound)

    function onWheel(event: WheelEvent) {
      const viewLength = new Vector(
        this.viewRange.x.diff() as number, 
        this.viewRange.y.diff() as number
      )
      const svgPos = mousePosition(this.frameGroup, event)
      const transform = this.plotGroup.getCTM()
      if (!svgPos || !transform) return

      const drawPos = screenToDrawPosition(svgPos, transform)!

      const dw = viewLength.x * Math.sign(-event.deltaY) * 0.05
      const dh = viewLength.y * Math.sign(-event.deltaY) * 0.05

      const dx = dw * ((drawPos.x - this.viewRange.x[0]) / viewLength.x)
      const dy = dh * ((drawPos.y - this.viewRange.y[0]) / viewLength.y)
      
      this.viewRange.x[0] += dx
      this.viewRange.y[0] += dy

      this.viewRange.x[1] = this.viewRange.x[0] + (viewLength.x - dw)
      this.viewRange.y[1] = this.viewRange.y[0] + (viewLength.y - dh)

      this.transformView()
    }
  }

  private resizeOnDrag() {
    const dragButton = 0
    let dragged: boolean
    let dragPos: DOMPoint|null

    const onClickBound = onClick.bind(this)
    this.eventListeners.storeEventListener('mousedown', this.frameGroup, onClickBound)

    function onClick(event: MouseEvent) {
    
      if (event.button !== dragButton) return
      event.preventDefault()

      dragged = true

      // Click coordinates
      const clickPos = mousePosition(this.frameGroup, event)
      if (!clickPos) {
        dragged = false
        return
      }

      // Coverage rectangle
      const path = {
        id: 'zoom-rect',
        fill: 'rgb(var(--color-secondary))', opacity: '0.1',
      }
      addChildElement(this.frameGroup, 'path', path)

      this.frameGroup.addEventListener('mousemove', onDrag.bind(this, clickPos))
      this.frameGroup.addEventListener('mouseup', endDrag.bind(this, clickPos))
    }

    // Draw coverage rectangle on drag
    function onDrag(clickPos: Vector, event: MouseEvent) {
      if (!dragged) return

      dragPos = mousePosition(this.frameGroup, event)
      if (!dragPos || !clickPos) return
      
      const path = document.getElementById('zoom-rect')
      const d = `M${clickPos.x},${clickPos.y} L${dragPos.x},${clickPos.y} ${dragPos.x},${dragPos.y} ${clickPos.x},${dragPos.y}Z`
      path?.setAttribute('d', d)
    }

    // Resize on mouseup
    function endDrag(clickPos: Vector) {
      dragged = false
      if (!clickPos || !dragPos) return

      const path = document.getElementById('zoom-rect')
      path?.remove()

      const svgTopLeft = new Vector(
        Math.min(clickPos.x, dragPos.x),
        Math.min(clickPos.y, dragPos.y)
      )
      const topLeft = this.svgToDrawPosition(svgTopLeft)

      const svgBottomRight = new Vector(
        Math.max(clickPos.x, dragPos.x),
        Math.max(clickPos.y, dragPos.y)
      )
      const bottomRight = this.svgToDrawPosition(svgBottomRight)

      this.viewRange = {
        x: new Vector(topLeft.x, bottomRight.x),
        y: new Vector(topLeft.y, bottomRight.y)
      }
      this.transformView()

      // Cleanup event handlers
      this.frameGroup.removeEventListener('mousemove', onDrag.bind(this))
      this.frameGroup.removeEventListener('mouseup', endDrag.bind(this))
    }
  }

  public fitViewToPlots(fn?: string, offset: number = 0.1) {

    let yMin: number, yMax: number
    if (fn) {
      yMin = this.plots[fn].yBounds[0]
      yMax = this.plots[fn].yBounds[1]
    } else {
      yMin = this.viewRange.y[0]
      yMax = this.viewRange.y[1]

      for (let fn in this.plots) {
        if (this.plots[fn].yBounds[0] > yMin) yMin = this.plots[fn].yBounds[0]
        if (this.plots[fn].yBounds[1] < yMax) yMax = this.plots[fn].yBounds[1]
      }
    }
    const newViewRange = {
      x: new Vector(this.viewRange.x[0], yMin - offset),
      y: new Vector(this.viewRange.x[1], yMax + offset)
    }
    if (newViewRange !== this.viewRange) this.viewRange = newViewRange
    this.transformView()
  }

  private transformView(pan = false) {

    this.setFrameTransform()
    this.setViewTransform()

    this.transformGrid()
    this.transformAxis()

    setSvgTransform(this.frameGroup, this.frameGroup.getCTM()!)
    setSvgTransform(this.plotGroup, this.plotGroup.getCTM()!)

    if (!pan) {
      this.redrawPlots()
    } 
  }
    
  private ticks(redraw = false) {
  
    const axis = document.getElementById('axis-group')!
    const transform = this.plotGroup.getCTM()!

    const svgSize = {
      x: this.svgElement.getBoundingClientRect().width,
      y: this.svgElement.getBoundingClientRect().height,
    }

    const clamp = (key: string) => {
      const axisOffset = {x: -30, y: 15}
      const minOffset = {x: 10, y: 15}
      const maxOffset = {x: 30, y: 10}
      
      const translate = (key === 'x') ?
        transform.e : transform.f

      if (translate < 0) return `${minOffset[key]}`

      if (translate > svgSize[key]) return `${svgSize[key] - maxOffset[key]}`

      return `${translate + axisOffset[key]}`
    }

    const tickFormat = (tick: number, index: number): string => {
      if (tick === 0) return '0'

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

    const iterateTicks = (index: number, key: string) => {
      const perp = (key === 'x') ? 'y' : 'x' 

      const step = this.gridSize[index]

      const scale = (index === 0) ? 
        transform.a : transform.d

      const translate = (index === 0) ? 
        transform.e : transform.f

      let tick = (index === 0) ? 
        this.viewRange.x[0] : this.viewRange.y[0]
      
      if (tick % step !== 0) {
        tick += (tick < 0) ? (-tick % step) : (step - tick % step)
      }
      let i = (tick * scale) + translate

      while (i < svgSize[key]) {

        if (tick === 0) {
          tick += step
          i += step * scale
          continue
        }
        const attr = {
          class: 'tick-text',
          'font-size': '0.75rem',
          fill: 'rgba(var(--color-text) / 1)' 
        }
        attr[`${key}`] = i,
        attr[`${perp}`] = clamp(perp)
        const txt = document.createElementNS(this.xmlns, 'text')
        setAttributes(txt, attr)
        axis.appendChild(txt)
        txt.innerHTML = `${tickFormat(tick, index)}`

        tick += step
        i += step * scale
      }
    }

    if (redraw) {
      removeElementsByClass(axis, 'tick-text')
    }

    for (const [index, key] of ['x', 'y'].entries()) {
      iterateTicks(index, key)
    }
  }

  public axes() {
    // Pattern
    const attr = {
      id: 'axis-pattern', patternUnits: 'userSpaceOnUse',
      width: '100%', height: '100%',
    }
    const pattern = document.createElementNS(this.xmlns, 'pattern')
    setAttributes(pattern, attr)
    
    const transform = this.plotGroup.getCTM()!
    // Axis lines
    let line = {
      class: 'x-axis',
      x1: '0', y1: `${transform.f}`, x2: '100%', y2: `${transform.f}`,
      stroke: 'rgba(var(--color-text) / 1)', 'stroke-width': '0.3',
    }
    addChildElement(pattern, 'line', line)

    line['class'] = 'y-axis',
    line['x1'] = `${transform.e}`, line['y1'] = '0'
    line['x2'] = `${transform.e}`, line['y2'] = '100%'
    addChildElement(pattern, 'line', line)

    this.svgDefs.appendChild(pattern)

    // Axis rectangle
    const rect = {
      class: 'axis-rect', width: '100%', height: '100%',
      fill: 'url(#axis-pattern)', 
      'vector-effect': 'non-scaling-stroke'
    }

    const axis = document.getElementById('axis-group')!
    addChildElement(axis, 'rect', rect)

    // Ticks
    this.ticks() 
  }

  private transformAxis() {
    const pattern = document.getElementById('axis-pattern')!
    const transform = this.plotGroup.getCTM()!

    // x axis
    let line = pattern.getElementsByClassName('x-axis')[0]
    
    let xAttr = {y1: `${transform.f}`, y2: `${transform.f}`}
    setAttributes(line, xAttr)

    // y axis
    line = pattern.getElementsByClassName('y-axis')[0]
    let yAttr = {x1: `${transform.e}`, x2: `${transform.e}`}
    setAttributes(line, yAttr)

    // Ticks
    this.ticks(true)
  }

  public grid() {
    const transform = this.plotGroup.getCTM()!
    
    const min = [
      this.minGridScreenSize / transform.a,
      this.minGridScreenSize / transform.d
    ]
    this.gridSize = new Vector(
      intervalLength(min[0])!,
      intervalLength(min[1])!
    )
    // Pattern
    const attr = {
      id: 'grid-pattern', patternUnits: 'userSpaceOnUse',
      patternTransform: DOMMatrix.fromMatrix(transform).toString(),
      width: `${this.gridSize.x}`, height: `${this.gridSize.y}`,
    }
    const pattern = document.createElementNS(this.xmlns, 'pattern')
    setAttributes(pattern, attr)
    
    // Horizontal line
    let line = {
      class: 'y-grid',
      x1: '0', y1: '0', x2: `${this.gridSize.x}`, y2: '0',
      stroke: 'rgba(var(--color-text) / 0.2)', 'stroke-width': `${1/transform.d}`,
    }
    addChildElement(pattern, 'line', line)

    // Vertical line
    line['class'] = 'x-grid',
    line['x2'] = '0', line['y2'] = `${this.gridSize.y}`
    line['stroke-width'] = `${1/transform.a}`
    addChildElement(pattern, 'line', line)

    this.svgDefs.appendChild(pattern)

    // Grid rectangle
    const rect = {
      class: 'grid-rect', width: '100%', height: '100%',
      fill: 'url(#grid-pattern)', 'vector-effect': 'non-scaling-stroke'
    }
    const grid = document.getElementById('grid-group')!
    addChildElement(grid, 'rect', rect)
  }

  public transformGrid() {
    const transform = this.plotGroup.getCTM()!

    const min = [
      this.minGridScreenSize / transform.a,
      this.minGridScreenSize / transform.d
    ]
    this.gridSize = new Vector(
      intervalLength(min[0])!,
      intervalLength(min[1])!
    )

    const pattern = document.getElementById('grid-pattern')!
    const attr = {
      patternTransform: DOMMatrix.fromMatrix(transform).toString(),
      width: `${this.gridSize.x}`, height: `${this.gridSize.y}`,
    }
    setAttributes(pattern, attr)

    // Horizontal grid line
    let line = pattern.getElementsByClassName('y-grid')[0]
    let yAttr = {
      x2: `${this.gridSize.x}`,
      'stroke-width': `${1/transform.d}`,
    }
    setAttributes(line, yAttr)
    
    // Vertical grid line
    line = pattern.getElementsByClassName('x-grid')[0]
    let xAttr = {
      y2: `${this.gridSize.y}`,
      'stroke-width': `${1/transform.a}`,
    }
    setAttributes(line, xAttr)
  }

  public innerShadow() {
    const filter = document.createElementNS(this.xmlns, 'filter') as SVGFilterElement
    setAttributes(filter, {id: 'inset-shadow'})

    // Shadow offset
    const feOffset = document.createElementNS(this.xmlns, 'feOffset') as SVGFEOffsetElement
    setAttributes(feOffset, {dx: '0', dy: '0'})
    filter.appendChild(feOffset)

    // Shadow blur
    const feBlur = document.createElementNS(this.xmlns, 'feGaussianBlur') as SVGFEGaussianBlurElement
    setAttributes(feBlur, {stdDeviation: '1', result: 'offset-blur'})
    filter.appendChild(feBlur)

    // Invert drop shadow to make inset shadow
    const feComposite1 = document.createElementNS(this.xmlns, 'feComposite') as SVGFECompositeElement
    setAttributes(feComposite1, {
      operator: 'out',
      in: 'SourceGraphic',
      in2: 'offset-blur',
      result: 'inverse'
    })
    filter.appendChild(feComposite1)

    // Cur colour inside shadow
    const feFlood = document.createElementNS(this.xmlns, 'feFlood') as SVGFEFloodElement
    setAttributes(feFlood, {
      'flood-color': 'black',
      'flood-opacity': '1',
      result: 'color'
    })
    filter.appendChild(feFlood)

    const feComposite2 = document.createElementNS(this.xmlns, 'feComposite') as SVGFECompositeElement
    setAttributes(feComposite2, {
      operator: 'in',
      in: 'color',
      in2: 'inverse',
      result: 'shadow'
    })
    filter.appendChild(feComposite2)

    // Place shadow over element
    const feComposite3 = document.createElementNS(this.xmlns, 'feComposite') as SVGFECompositeElement
    setAttributes(feComposite3, {
      operator: 'over',
      in: 'shadow',
      in2: 'ShadowGraphic',
    })
    filter.appendChild(feComposite3)

    this.svgDefs.appendChild(filter)
  }

  public plot(fn: string, clr: string = 'red', redraw = false, points?: number) {

    // Check if the same function has been plotted already
    if (!redraw) {
      if (fn in this.plots){
        console.warn('Function already plotted: ' + fn)
        return null
      }
    }
    const lambda = mathParse(fn).compile()
    if (!lambda) return null

    const viewWidth = this.viewRange.x.diff() as number

    if (!points) points = parseInt(this.svgElement.getAttribute('width')!)

    const domain = Vector.linspace(
      this.viewRange.x[0] - viewWidth, 
      this.viewRange.x[1] + viewWidth, 
      points*3
    ).toArray()

    const path: string[] = Array(domain.length).fill('')

    let y = -lambda.evaluate({x: domain[0]})
    path[0] = `M${domain[0]},${y}`

    let yMin = y, yMax = y
    for (let i = 1; i < path.length; i++) {
      let y = -lambda.evaluate({x: domain[i]})

      if (y < yMin) yMin = y
      if (y > yMax) yMax = y

      path[i] = `${domain[i]},${y}`
    }
    path[1] = `L${path[1]}`

    const attr = {
      id: fn,
      class: 'plot-path',
      d: path.join(' '), fill: 'none', stroke: clr,
      'stroke-width': '2px', 'vector-effect': 'non-scaling-stroke'
      //'stroke-width': `${1/((this.transform[0] + this.transform[3])/2)}`
    }  
    addChildElement(this.plotGroup, 'path', attr)

    this.plots[fn] = {
      yBounds: [yMin, yMax],
      color: clr
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
      path.setAttribute('stroke', color)
      this.plots[fn].color = color
    }
  }

  public listPlots(): string[] {
    return Object.keys(this.plots)
  }

  public updatePlots(plots: {[fn: string]: {color: string}}) {
    const oldFns = new Set(Object.keys(this.plots))
    const newFns = new Set(Object.keys(plots))

    const delFns = difference(oldFns, newFns)
    for (let fn of delFns) {
      this.deletePlot(fn)
    }

    const addFns = difference(newFns, oldFns)
    for (let fn of addFns) {
      this.plot(fn, plots[fn].color)
    }

    const changeFns = intersection(oldFns, newFns)
    for (let fn of changeFns) {
      this.changeColor(fn, plots[fn].color)
    }
  }

  private redrawPlots() {
    for (let fn in this.plots) {
      const yBounds = this.plots[fn].yBounds
      const redraw = !(
        this.viewRange.y[0] > yBounds[1] ||
        this.viewRange.y[1] < yBounds[0]
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