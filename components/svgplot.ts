import {parse as mathParse} from 'mathjs'
import { difference, intersection } from 'utils/num'

import Vector from 'utils/vector'
import { setAttributes, removeElementsByClass, addChildElement } from 'utils/svg'

type SvgPlots = {
  [key: string] : {
    yBounds: number[],
    color: string,
  }
}

export class SVGPlot {
  private xmlns: string = 'http://www.w3.org/2000/svg'
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private plotGroup: SVGGElement
  private scale = new Vector(1, 1)
  private translate = new Vector(0, 0)
  private viewPoints: number[][]
  private gridSize = new Vector(1, 1)
  private plots: SvgPlots = {}
  private boundHandlers: {[event: string]: EventListenerOrEventListenerObject[]} = {}

  constructor(container: HTMLDivElement, 
    width?: number, height?: number, viewBox?: string, 
    viewPoints = [[-10, -10], [10, 10]]) 
  {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    if (!width) width = rect.width
    if (!height) height = rect.height
    if (!viewBox) viewBox = `0 0 ${width} ${height}` // Viewbox matches viewport by default

    this.viewPoints = viewPoints
    
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
    addChildElement(this.svgElement, 'g', {id: 'grid-group'})
    addChildElement(this.svgElement, 'g', {id: 'axis-group'})

    this.plotGroup = document.createElementNS(this.xmlns, 'g') as SVGGElement
    const gAttr = {
      id: 'plot-group',
      transform: this.transformMatrix(),
    }
    setAttributes(this.plotGroup, gAttr)
    this.svgElement.appendChild(this.plotGroup)

    addChildElement(this.svgElement, 'g', {id: 'pointer-group'})

    // Transform matrix
    this.setTransform(width, height)

    // Add functionality
    this.coordsOnMove()
    this.panOnDrag()
    this.zoomOnWheel()
    this.resizeOnDrag()
  }

  public cleanup() {
    // Cleanup bound event handlers
    for (let event in this.boundHandlers) {
      for (let handler of this.boundHandlers[event]) {
        this.svgElement.removeEventListener(event, handler)
      }
    }
    // Remove svg
    this.svgElement.parentNode.removeChild(this.svgElement)
  }

  private addBoundHandler(event: string, handler: EventListenerOrEventListenerObject) {
    if (!Object.hasOwn(this.boundHandlers, event)) {
      this.boundHandlers[event] = []
    }
    this.boundHandlers[event].push(handler)
  }

  private addElement(tagName: string, attributes: {[key: string]: string}) {
    const element = document.createElementNS(this.xmlns, tagName)
    setAttributes(element, attributes)
    this.svgElement.appendChild(element)
  }

  public resize(width: number, height: number) {
    const viewBox = `0 0 ${width} ${height}` // Viewbox matches viewport by default
    const attr = {
      width: width.toString(),
      height: height.toString(),
      viewBox: viewBox,
    }
    setAttributes(this.svgElement, attr)
    this.setTransform(width, height)
    this.transformView()
  }
    
  private transformMatrix() {
    const matrix = [
      this.scale.x, 0, 0, this.scale.y, 
      this.translate.x, this.translate.y
    ]
    return `matrix(${matrix.join(' ')})`
  }

  private setTransform(width?: number, height?: number) {

    if (!width) width = parseFloat(this.svgElement.getAttribute('width'))
    if (!height) height = parseFloat(this.svgElement.getAttribute('height'))

    const viewLength = [
      this.viewPoints[1][0] - this.viewPoints[0][0],
      this.viewPoints[1][1] - this.viewPoints[0][1]
    ]
    // Set scale
    this.scale.x = width / viewLength[0]
    this.scale.y = height / viewLength[1]

    // Set translation
    this.translate.x = width * (-this.viewPoints[0][0] / viewLength[0])
    this.translate.y = height * (-this.viewPoints[0][1] / viewLength[1])
  }

  private svgToDrawCoord(svgCoord: Vector): Vector {
    return new Vector(
      (svgCoord.x - this.translate.x) / this.scale.x,
      (svgCoord.y - this.translate.y) / this.scale.y
    )
  }

  private mouseCoords(svg: SVGSVGElement, event: MouseEvent): Vector {
    const ctm = svg.getScreenCTM()
    return new Vector(
      (event.clientX - ctm.e) / ctm.a,
      (event.clientY - ctm.f) / ctm.d
    )
  }

  private coordsOnMove() {
    const attr = {
      id: 'coord-pointer',
      'font-size': '0.75em',
      fill: 'rgba(var(--color-text) / 1)'
    }
    const pointer = document.getElementById('pointer-group')
    addChildElement(pointer, 'text', attr)

    let path = {
      id: 'x-pointer', d: '',
      stroke: 'rgba(var(--color-text) / 1)', 'stroke-width': '1px', 'stroke-dasharray': '5px',
      opacity: '0.5', 'vector-effect': 'non-scaling-stroke',
    }
    addChildElement(pointer, 'path', path)
    path['id'] = 'y-pointer'
    addChildElement(pointer, 'path', path)

    const coordsOnMoveBound = this.coordsOnMoveHandler.bind(this)
    this.addBoundHandler('mousedown', coordsOnMoveBound)
    this.svgElement.addEventListener('mousemove', coordsOnMoveBound)
  }

  private coordsOnMoveHandler(event: MouseEvent) {
    //if (event.target !== this.svgElement) return
    const coordText = (coord: number, key: string) => {
      if (this.gridSize[key] < 0.01 || this.gridSize[key] > 999) {
        return coord.toExponential(2)
      }
      return coord.toFixed(2)
    }

    const svgCoord = this.mouseCoords(this.svgElement, event)
    const drawCoord = this.svgToDrawCoord(svgCoord)
    
    const pointer = document.getElementById('coord-pointer')
    pointer.setAttribute('x', `${svgCoord.x + 15}`)
    pointer.setAttribute('y', `${svgCoord.y + 20}`)
    
    pointer.innerHTML = `(${coordText(drawCoord.x, 'x')}, ${coordText(-drawCoord.y, 'y')})`

    const xLine = document.getElementById('x-pointer')
    xLine.setAttribute('d', `M${svgCoord.x},${this.translate.y}L${svgCoord.x},${svgCoord.y}`)

    const yLine = document.getElementById('y-pointer')
    yLine.setAttribute('d', `M${this.translate.x},${svgCoord.y}L${svgCoord.x}, ${svgCoord.y}`)
  }

    private panOnDragHandler(event: MouseEvent, dragButton: number = 1) {

    if (event.button !== dragButton) {
      return
    }
    // Click coordinates
    let oldCoords = this.mouseCoords(this.svgElement, event)

    // Pan on drag
    const panOnMoveHandler = (move: MouseEvent) => {
      let newCoords = this.mouseCoords(this.svgElement, move)
      let dist = {
        x: (oldCoords.x - newCoords.x) / this.scale.x,
        y: (oldCoords.y - newCoords.y) / this.scale.y
      }
      this.viewPoints[0][0] += dist.x
      this.viewPoints[1][0] += dist.x
      this.viewPoints[0][1] += dist.y
      this.viewPoints[1][1] += dist.y

      this.transformView(true)

      oldCoords = this.mouseCoords(this.svgElement, move)
    }
    const panOnMoveBound = panOnMoveHandler.bind(this)

    // Cleanup listeners on mouseup
    const onMouseUp = () => {
      this.redrawPlots()
      this.svgElement.removeEventListener('mouseup', onMouseUp)
      this.svgElement.removeEventListener('mousemove', panOnMoveBound)
    }
    this.svgElement.addEventListener('mouseup', onMouseUp)
    this.svgElement.addEventListener('mousemove', panOnMoveBound)
  }

  private panOnDrag() {
    const panOnDragBound = this.panOnDragHandler.bind(this)
    this.addBoundHandler('mousedown', panOnDragBound)
    this.svgElement.addEventListener('mousedown', panOnDragBound)
  }

  private zoomOnWheelHandler(event: WheelEvent, zoomStep: number = 1) {
    const viewLengths = {
        x: this.viewPoints[1][0] - this.viewPoints[0][0],
        y: this.viewPoints[1][1] - this.viewPoints[0][1]
    }
    const svgCoord = this.mouseCoords(this.svgElement, event)
    const drawCoord = {
        x: (svgCoord.x - this.translate.x) / this.scale.x,
        y: (svgCoord.y - this.translate.y) / this.scale.y
    }
    const dw = viewLengths.x * Math.sign(-event.deltaY) * 0.05
    const dh = viewLengths.y * Math.sign(-event.deltaY) * 0.05

    const dx = dw * ((drawCoord.x - this.viewPoints[0][0]) / viewLengths.x)
    const dy = dh * ((drawCoord.y - this.viewPoints[0][1]) / viewLengths.y)

    this.viewPoints[0][0] += dx
    this.viewPoints[0][1] += dy

    this.viewPoints[1][0] = this.viewPoints[0][0] + (viewLengths.x - dw)
    this.viewPoints[1][1] = this.viewPoints[0][1] + (viewLengths.y - dh)

    this.transformView()
  }

  private zoomOnWheel() {
    const zoomOnWheelBound = this.zoomOnWheelHandler.bind(this)
    this.addBoundHandler('wheel', zoomOnWheelBound)
    this.svgElement.addEventListener('wheel', zoomOnWheelBound)
  }

  private resizeOnDragHandler(event: MouseEvent, dragButton: number = 0) {
    if (event.button !== dragButton) return

    // Click coordinates
    let clickCoords = this.mouseCoords(this.svgElement, event)

    // Coverage rectangle
    const pointer = document.getElementById('pointer-group')
    const path = document.createElementNS(this.xmlns, 'path')
    let attr = {
      id: 'zoom-rect',
      fill: 'blue', opacity: '0.1',
    }
    setAttributes(path, attr)
    pointer.appendChild(path)

    let dragCoords: Vector

    // Draw coverage rectangle on drag
    const rectOnMoveHandler = (move: MouseEvent) => {
      dragCoords = this.mouseCoords(this.svgElement, move)
      const d = `M${clickCoords.x},${clickCoords.y} L${dragCoords.x},${clickCoords.y} ${dragCoords.x},${dragCoords.y} ${clickCoords.x},${dragCoords.y}Z`
      path.setAttribute('d', d)
    }
    const rectOnMoveBound = rectOnMoveHandler.bind(this)

      // Resize on mouseup
      const onMouseUp = () => {
        path.parentNode.removeChild(path)

        const svgTopLeft = new Vector(
            Math.min(clickCoords.x, dragCoords.x),
            Math.min(clickCoords.y, dragCoords.y)
        )
        const topLeft = this.svgToDrawCoord(svgTopLeft)

        const svgBottomRight = new Vector(
            Math.max(clickCoords.x, dragCoords.x),
            Math.max(clickCoords.y, dragCoords.y)
        )
        const bottomRight = this.svgToDrawCoord(svgBottomRight)

        this.viewPoints = [
            [topLeft.x, topLeft.y],
            [bottomRight.x, bottomRight.y]
        ]
        this.transformView()

        // Cleanup event handlers
        this.svgElement.removeEventListener('mouseup', onMouseUp)
        this.svgElement.removeEventListener('mousemove', rectOnMoveBound)
    }
    this.svgElement.addEventListener('mouseup', onMouseUp)
    this.svgElement.addEventListener('mousemove', rectOnMoveBound)
  }

  private resizeOnDrag() {
    const resizeOnDragBound = this.resizeOnDragHandler.bind(this)
    this.addBoundHandler('mousedown', resizeOnDragBound)
    this.svgElement.addEventListener('mousedown', resizeOnDragBound)
  }

    public fitViewToPlots(fn?: string, offset: number = 0.1) {

        let yMin: number, yMax: number
        if (fn) {
            yMin = this.plots[fn].yBounds[0]
            yMax = this.plots[fn].yBounds[1]
        } else {
            yMin = this.viewPoints[0][1]
            yMax = this.viewPoints[1][1]

            for (let fn in this.plots) {
                if (this.plots[fn].yBounds[0] > yMin) yMin = this.plots[fn].yBounds[0]
                if (this.plots[fn].yBounds[1] < yMax) yMax = this.plots[fn].yBounds[1]
            }
        }
        const newViewPoints = [
            [this.viewPoints[0][0], yMin - offset],
            [this.viewPoints[1][0], yMax + offset]
        ]
        if (newViewPoints !== this.viewPoints) this.viewPoints = newViewPoints
        this.transformView()
    }

    private transformView(pan = false) {

        this.setTransform()
        this.transformGrid()
        this.transformAxis()
        this.plotGroup.setAttribute('transform', this.transformMatrix())

        if (!pan) {
            this.redrawPlots()
        } 
    }
    
  private ticks(redraw = false) {

    const axis = document.getElementById('axis-group')
    const svgSize = {
      x: parseFloat(this.svgElement.getAttribute('width')),
      y: parseFloat(this.svgElement.getAttribute('height')),
    }
    if (redraw) {
      removeElementsByClass(axis, 'tick-text')
    }
    const clamp = (key: string) => {
      const axisOffset = {x: -30, y: 15}
      const minOffset = {x: 10, y: 15}
      const maxOffset = {x: 30, y: 10}

      if (this.translate[key] < 0) return `${minOffset[key]}`

      if (this.translate[key] > svgSize[key]) return `${svgSize[key] - maxOffset[key]}`

      return `${this.translate[key] + axisOffset[key]}`
    }
    const tickFormat = (tick: number, ix: string): string => {
      if (tick === 0) return '0'

      if (ix === 'y') {
        tick *= -1
      }
      if (this.gridSize[ix] > 999) {
        return tick.toExponential(0)
      }
      if (this.gridSize[ix] < 0.01) {
        return tick.toExponential(3)
      }
      if (this.gridSize[ix] < 0.1) {
        return tick.toFixed(2)
      }
      if (this.gridSize[ix] < 1) {
        return tick.toFixed(1)
      }
      return tick.toFixed(0)
    }
    const iterateTicks = (key: string) => {
      const perp = key === 'x' ? 'y' : 'x' 

      const step = this.gridSize[key]

      let tick = (key === 'x') ?
        this.viewPoints[0][0] : this.viewPoints[0][1] 

      if (tick % step !== 0) {
        tick += (tick < 0) ? (-tick % step) : (step - tick % step)
      }
      let i = (tick * this.scale[key]) + this.translate[key]

      while (i < svgSize[key]) {

        if (tick === 0) {
          tick += step
          i += step * this.scale[key]
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
        txt.innerHTML = `${tickFormat(tick, key)}`

        tick += step
        i += step * this.scale[key]
      }
    }
    for (let key of ['x', 'y']) {
      iterateTicks(key)
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

    // Axis lines
    let line = {
      class: 'x-axis',
      x1: '0', y1: `${this.translate.y}`, x2: '100%', y2: `${this.translate.y}`,
      stroke: 'rgba(var(--color-text) / 1)', 'stroke-width': '0.3',
    }
    addChildElement(pattern, 'line', line)

    line['class'] = 'y-axis',
    line['x1'] = `${this.translate.x}`, line['y1'] = '0'
    line['x2'] = `${this.translate.x}`, line['y2'] = '100%'
    addChildElement(pattern, 'line', line)

    this.svgDefs.appendChild(pattern)

    // Axis rectangle
    const rect = {
      class: 'axis-rect', width: '100%', height: '100%',
      fill: 'url(#axis-pattern)', 
      'vector-effect': 'non-scaling-stroke'
    }

    const axis = document.getElementById('axis-group')
    addChildElement(axis, 'rect', rect)

    // Ticks
    this.ticks()
    
  } 

  private transformAxis() {
    const pattern = document.getElementById('axis-pattern')

    // x axis
    let line = pattern.getElementsByClassName('x-axis')[0]
    let xAttr = {y1: `${this.translate.y}`, y2: `${this.translate.y}`}
    setAttributes(line, xAttr)

    // y axis
    line = pattern.getElementsByClassName('y-axis')[0]
    let yAttr = {x1: `${this.translate.x}`, x2: `${this.translate.x}`}
    setAttributes(line, yAttr)

    // Ticks
    this.ticks(true)
  }

  private gridIntervals(minScreenLength: number = 50) {

    const intervalLength = (minLength: number) => {
      const power = Math.floor(Math.log10(minLength))
      const base = minLength*10**(-power)

      if (base < 2) return Math.ceil(base) * 10**power

      if (base > 2 && base < 5) return 5 * 10**power

      if (base > 5) return 10**(power + 1)
    }
    const min = [
        minScreenLength/this.scale.x,
        minScreenLength/this.scale.y
    ]
    this.gridSize = new Vector(
        intervalLength(min[0]),
        intervalLength(min[1])
    )
  }

  public grid() {
    this.gridIntervals()

    // Pattern
    const attr = {
      id: 'grid-pattern', patternUnits: 'userSpaceOnUse',
      patternTransform: this.transformMatrix(),
      width: `${this.gridSize.x}`, height: `${this.gridSize.y}`,
    }
    const pattern = document.createElementNS(this.xmlns, 'pattern')
    setAttributes(pattern, attr)
    
    // Grid pattern rectangle
    //const path = {
    //    d: 'M1,0 L0,0 0,1', fill: 'none', 
    //    stroke: 'gray', 'stroke-width': '1px',//`${1/this.transform[0]}`,
    //    'vector-effect': 'non-scaling-stroke'
    //}

    // Horizontal line
    let line = {
      class: 'y-grid',
      x1: '0', y1: '0', x2: `${this.gridSize.x}`, y2: '0',
      stroke: 'rgba(var(--color-text) / 0.2)', 'stroke-width': `${1/this.scale.y}`,
    }
    addChildElement(pattern, 'line', line)

    // Vertical line
    line['class'] = 'x-grid',
    line['x2'] = '0', line['y2'] = `${this.gridSize.y}`
    line['stroke-width'] = `${1/this.scale.x}`
    addChildElement(pattern, 'line', line)

    this.svgDefs.appendChild(pattern)

    // Grid rectangle
    const rect = {
      class: 'grid-rect', width: '100%', height: '100%',
      fill: 'url(#grid-pattern)', 'vector-effect': 'non-scaling-stroke'
    }
    const grid = document.getElementById('grid-group')
    addChildElement(grid, 'rect', rect)
  }

  public transformGrid() {
    this.gridIntervals()

    const pattern = document.getElementById('grid-pattern')
    const attr = {
      patternTransform: this.transformMatrix(),
      width: `${this.gridSize.x}`, height: `${this.gridSize.y}`,
    }
    setAttributes(pattern, attr)

    // Horizontal grid line
    let line = pattern.getElementsByClassName('y-grid')[0]
    let yAttr = {
      x2: `${this.gridSize.x}`,
      'stroke-width': `${1/this.scale.y}`,
    }
    setAttributes(line, yAttr)
    
    // Vertical grid line
    line = pattern.getElementsByClassName('x-grid')[0]
    let xAttr = {
      y2: `${this.gridSize.y}`,
      'stroke-width': `${1/this.scale.x}`,
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

    const viewWidth = this.viewPoints[1][0] - this.viewPoints[0][0]

    if (!points) points = parseInt(this.svgElement.getAttribute('width'))

    const domain = Vector.linspace(this.viewPoints[0][0] - viewWidth, this.viewPoints[1][0] + viewWidth, points*3).toArray()

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
    addChildElement(document.getElementById('plot-group'), 'path', attr)

    this.plots[fn] = {
      yBounds: [yMin, yMax],
      color: clr
    }
  }

  public deletePlot(fn: string) {
    if (fn in this.plots) {
      const path = document.getElementById(fn)
      path.parentNode.removeChild(path)
      delete this.plots[fn]
    }
  }

  public changeColor(fn: string, color: string) {
    if (fn in this.plots) {
      const path = document.getElementById(fn)
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
        this.viewPoints[0][1] > yBounds[1] ||
        this.viewPoints[1][1] < yBounds[0]
      )
      if (redraw) {
        const path = document.getElementById(fn)
        path.parentNode.removeChild(path)
        const clr = this.plots[fn].color
        this.plot(fn, clr, true)
      }
    }
  }
}