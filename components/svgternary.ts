import { action, makeObservable, observable } from 'mobx';
import { setAttributes, svgPoly, mousePosition, addChildElement, EventStore } from 'utils/svg'
import Vector from 'utils/vector'

const SIN60 = Math.sqrt(3) / 2
const TAN30 = Math.sqrt(3) / 3

type TernaryValue = {
  point: number[],
  director: number
}

export class TernaryStore {
  public point: number[]
  public director: number

  constructor(point?: number[], director?: number) {
    if (point) this.point = point
    if (director) this.director = director

    makeObservable(this, {
      point: observable,
      director: observable,
      setPoint: action,
      setDirector: action,
    })
  }

  public setPoint(point: number[]) {
    this.point = point
  }

  public setDirector(director: number) {
    this.director = director
  }
}

export default class SVGTernaryPlot {
  private xmlns: string = 'http://www.w3.org/2000/svg'
  private margin: number = 0.1
  private side: number
  private translate = new Vector(0, 0)
  private colors = {
    axis: {a: 'red', b: 'green', c: 'blue'},
    director: 'orange',
    point: 'black'
  }
  private value: TernaryValue
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private frameGroup: SVGGElement
  private eventListeners: EventStore = {}

  constructor(
    container: HTMLDivElement,
    initialValue?: TernaryValue,
    size?: number,
    margin?: number,
    axisColors?: string[],
    directorColor?: string,
    pointColor?: string,
  ) {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    if (!size) size = Math.min(rect.width, rect.height)

    if (margin) this.margin = margin

    if (initialValue) this.value = initialValue

    this.setColors(axisColors, directorColor, pointColor)

    // Create SVG element
    this.svgElement = document.createElementNS(this.xmlns, 'svg') as SVGSVGElement
    const svgAttr = {
      xmlns: this.xmlns,
      width: size.toString(),
      height: size.toString(),
      viewBox: `0 0 ${size} ${size}`,
    }
    setAttributes(this.svgElement, svgAttr)
    container.appendChild(this.svgElement)

    // Create defs element
    this.svgDefs = document.createElementNS(this.xmlns, 'defs') as SVGDefsElement
    this.svgElement.appendChild(this.svgDefs)

    // Transform matrix
    this.setTransform(size)

    // Creat group element
    this.frameGroup = document.createElementNS(this.xmlns, 'g') as SVGGElement
    let gAttr = {
      id: 'frame-group',
      transform: this.transformMatrix(),
    }
    setAttributes(this.frameGroup, gAttr)
    this.svgElement.appendChild(this.frameGroup)

    addChildElement(this.frameGroup, 'g', { id: 'grid-group' })
    addChildElement(this.frameGroup, 'g', { id: 'axis-group' })
    addChildElement(this.frameGroup, 'g', { id: 'crosshair-group' })
    addChildElement(this.frameGroup, 'g', { id: 'director-group' })
    addChildElement(this.frameGroup, 'g', { id: 'plot-group' })

    this.drawTriangle()

    // Add functionality
    this.crosshair()
  }

  public cleanup() {
    // Cleanup bound event handlers
    for (let event in this.eventListeners) {
      for (let [el, handler] of this.eventListeners[event]) {
        el.removeEventListener(event, handler)
      }
    }
    // Remove svg
    //this.svgElement.parentNode?.removeChild(this.svgElement)
  }

  public getSvg(): SVGSVGElement {
    return this.svgElement
  }

  public getValue(): TernaryValue {
    return this.value
  }

  private setColors(axis?: string[], director?: string, point?: string) {
    if (axis) {
      this.colors.axis.a = axis[0]
      this.colors.axis.b = axis[1]
      this.colors.axis.c = axis[2]
    }

    if (director) {
      this.colors.director = director
    }

    if (point) {
      this.colors.point = point
    }
  }

  private transformMatrix() {
    const matrix = [
      1, 0, 0, -1,
      this.translate.x, this.translate.y
    ]
    return `matrix(${matrix.join(',')})`
  }

  private setTransform(size?: number) {
    if (!size) size = parseFloat(this.svgElement.getAttribute('width')!)

    // Set triangle side length
    this.side = size * (1 - 2 * this.margin)

    // Set translation
    this.translate.x = size * this.margin
    this.translate.y = size * (1 - this.margin)
  }

  private drawTriangle(stroke = 'black') {

    const vertices = [
      new Vector(0, 0),
      new Vector(this.side, 0),
      new Vector(this.side / 2, this.side * SIN60),
    ]
    const triangle = svgPoly(vertices)
    const attr = {
      id: 'ternary-polygon',
      points: triangle, fill: 'url(#grid-pattern)', stroke: stroke,
      'stroke-width': '2px', 'vector-effect': 'non-scaling-stroke'
    }

    const grid = document.getElementById('grid-group')!
    addChildElement(grid, 'polygon', attr)
  }

  public grid(division: number = 10) {
    const gridUnit = this.side / division

    // Pattern
    const attr = {
      id: 'grid-pattern', patternUnits: 'userSpaceOnUse',
      //patternTransform: this.transformMatrix(),
      width: `${gridUnit}`, height: `${2 * SIN60 * gridUnit}`,
    }
    const pattern = document.createElementNS(this.xmlns, 'pattern')
    setAttributes(pattern, attr)

    // Triangle grid
    const vertices = [
      new Vector(0, 2 * SIN60 * gridUnit),
      new Vector(gridUnit, 0),
      new Vector(0, 0),
      new Vector(gridUnit, 2 * SIN60 * gridUnit)
    ]
    let polyline = {
      points: svgPoly(vertices), fill: 'none',
      stroke: 'rgba(var(--color-text) / 0.2)', 'stroke-width': '1',
    }
    addChildElement(pattern, 'polyline', polyline)
    let line = {
      x1: '0', y1: `${gridUnit * SIN60}`,
      x2: `${gridUnit}`, y2: `${gridUnit * SIN60}`,
      stroke: 'rgba(var(--color-text) / 0.2)', 'stroke-width': '1',
    }
    addChildElement(pattern, 'line', line)
    this.svgDefs.appendChild(pattern)
  }

  public axis() {
    const axis = document.getElementById('axis-group')!

    // a (bottom-left)
    let line = {
      x1: `${(3 / 4) * this.side}`, y1: `${this.side * SIN60 / 2}`,
      x2: '0', y2: '0',
      stroke: this.colors.axis.a, 'stroke-width': '1',
    }
    addChildElement(axis, 'line', line)

    // b (bottom-right)
    line = {
      x1: `${this.side / 4}`, y1: `${this.side * SIN60 / 2}`,
      x2: `${this.side}`, y2: '0',
      stroke: this.colors.axis.b, 'stroke-width': '1',
    }
    addChildElement(axis, 'line', line)

    // c (vertical)
    line = {
      x1: `${this.side / 2}`, y1: '0',
      x2: `${this.side / 2}`, y2: `${this.side * SIN60}`,
      stroke: this.colors.axis.c, 'stroke-width': '1',
    }
    addChildElement(axis, 'line', line)
  }

  private projector() {
    return this.value.point[1] + this.value.director * this.value.point[2]
  }

  public point(value?: number[], store?: TernaryStore) {

    if (value) {
      if (value.length !== 3) {
        throw new Error('Point value must be a triple.')
      }
      this.value.point = value
    }

    const svgPos = this.ternaryToSvgPosition(this.value.point)
    const plot = document.getElementById('plot-group')!
    const circle = document.createElementNS(this.xmlns, 'circle') as SVGCircleElement
    circle.style.cursor = 'move'
    const attr = {
      id: 'plot-point', cx: `${svgPos.x}`, cy: `${svgPos.y}`, r: '1%',
      fill: this.colors.point
    }
    setAttributes(circle, attr)
    plot.appendChild(circle)

    const line = {
      id: 'plot-projector', x1: `${svgPos.x}`, y1: `${svgPos.y}`,
      x2: `${this.projector() * this.side}`, y2: '0', stroke: this.colors.point, 
      'stroke-width': '1', 'stroke-dasharray': '5'
    }
    addChildElement(plot, 'line', line)

    //const dragButton = 0
    let dragged: boolean
    const onClickBound = onClick.bind(this, store)
    this.storeEventListener('mousedown', circle, onClickBound)

    function onClick(store?: TernaryStore) {
      dragged = true

      this.svgElement.addEventListener('mousemove', onDrag.bind(this, store))
      this.svgElement.addEventListener('mouseup', endDrag.bind(this))
    }

    function onDrag(store: TernaryStore|undefined, event: MouseEvent) {
      if (!dragged) return

      const point = document.getElementById('plot-point')!
      const projector = document.getElementById('plot-projector')!

      event.preventDefault()
      const svgPos = mousePosition(this.svgElement, event)
      if (!svgPos) return

      svgPos.x -= this.translate.x
      svgPos.y = -svgPos.y + this.translate.y

      if (!this.inTriangle(svgPos)) return

      setAttributes(point, {cx: `${svgPos!.x}`, cy: `${svgPos!.y}`})
      this.value.point = this.svgToTernaryPosition(svgPos)
      setAttributes(projector, {
        x1: `${svgPos!.x}`, y1: `${svgPos!.y}`, 
        x2: `${this.projector() * this.side}`
      })

      if (store) store.setPoint(this.value.point)
    }

    function endDrag() {
      dragged = false
      this.svgElement.removeEventListener('mousemove', onDrag.bind(this, store))
      this.svgElement.removeEventListener('mouseup', endDrag.bind(this))
    }
  }

  public director(value?: number, store?: TernaryStore) {
    if (value) this.value.director = value

    const director = document.getElementById('director-group')!
    const circle = document.createElementNS(this.xmlns, 'circle') as SVGCircleElement
    circle.style.cursor = 'ew-resize'
    const attr = {
      id: 'director-point', cx: `${this.side * this.value.director}`, cy: '0', r: '1%',
      fill: this.colors.director
    }
    setAttributes(circle, attr)
    director.appendChild(circle)

    const line = {
      id: 'director-line', x1: `${this.side / 2}`, y1: `${this.side * SIN60}`,
      x2: `${this.side * this.value.director}`, y2: '0', 
      stroke: this.colors.director, 'stroke-width': '1',
      'stroke-dasharray': '5'
    }
    addChildElement(director, 'line', line)

    let dragged: boolean
    const onClickBound = onClick.bind(this, store)
    this.storeEventListener('mousedown', circle, onClickBound)

    function onClick(store?: TernaryStore) {
      dragged = true

      this.svgElement.addEventListener('mousemove', onDrag.bind(this, store))
      this.svgElement.addEventListener('mouseup', endDrag.bind(this))
    }

    function onDrag(store: TernaryStore|undefined, event: MouseEvent) {
      if (!dragged) return

      event.preventDefault()
      const svgPos = mousePosition(this.svgElement, event)
      if (!svgPos) return

      svgPos.x -= this.translate.x
      svgPos.y += this.translate.y

      if (svgPos.x < 0 || svgPos.x > this.side) return

      const point = document.getElementById('director-point')!
      const director = document.getElementById('director-line')!
      const projector = document.getElementById('plot-projector')

      point.setAttribute('cx', `${svgPos.x}`)
      director.setAttribute('x2', `${svgPos.x}`)
      projector?.setAttribute('x2', `${this.projector() * this.side}`)

      this.value.director = svgPos.x / this.side

      if (store) store.setDirector(this.value.director)
    }

    function endDrag() {
      dragged = false
      this.svgElement.removeEventListener('mousemove', onDrag.bind(this, store))
      this.svgElement.removeEventListener('mouseup', endDrag.bind(this))
    }
  }

  private svgToTernaryPosition(svgPos: Vector): number[] {
    const a = 1 - (svgPos!.x + svgPos!.y * TAN30) / this.side
    const b = (svgPos!.x - svgPos!.y * TAN30) / this.side
    const c = svgPos!.y / (this.side * SIN60)

    return [a, b, c]
  }

  private ternaryToSvgPosition(ternary: number[]): Vector {
    return new Vector(
      this.side * (ternary[1] + ternary[2] * SIN60 * TAN30), 
      ternary[2] * (this.side * SIN60)
    )
  }

  private inTriangle(svgPos: Vector | null): boolean {
    if (!svgPos) return false

    if (
      svgPos.y < 0 ||
      svgPos.y > this.side * SIN60
    ) return false

    if (
      svgPos.x < svgPos.y * TAN30 ||
      svgPos.x > this.side - svgPos.y * TAN30
    ) return false

    return true
  }

  private crosshair() {
    const crosshair = document.getElementById('crosshair-group')!

    // Coordinate crosshair text
    const attr = {
      id: 'crosshair-text',
      'font-size': '0.75em',
      fill: 'rgba(var(--color-text) / 1)',
      transform: 'scale(1, -1)'
    }
    addChildElement(crosshair, 'text', attr)

    // Coordinate crosshair lines
    let path = {
      id: 'crosshair-line-a', d: '',
      stroke: this.colors.axis.a, 'stroke-width': '1px', 'stroke-dasharray': '5px',
      opacity: '0.5', 'vector-effect': 'non-scaling-stroke',
    }
    addChildElement(crosshair, 'path', path)

    path['id'] = 'crosshair-line-b'
    path['stroke'] = this.colors.axis.b
    addChildElement(crosshair, 'path', path)

    path['id'] = 'crosshair-line-c'
    path['stroke'] = this.colors.axis.c
    addChildElement(crosshair, 'path', path)

    const onMouseMoveBound = onMouseMove.bind(this)
    this.storeEventListener('mousemove', this.frameGroup, onMouseMoveBound)

    function onMouseMove(event: MouseEvent) {

      const svgPos = mousePosition(this.frameGroup, event)
      if (!svgPos) return

      const text = document.getElementById('crosshair-text')!
      const aLine = document.getElementById('crosshair-line-a')!
      const bLine = document.getElementById('crosshair-line-b')!
      const cLine = document.getElementById('crosshair-line-c')!

      if (this.inTriangle(svgPos)) {
        const coord = this.svgToTernaryPosition(svgPos)

        text.setAttribute('x', `${svgPos!.x + 15}`)
        text.setAttribute('y', `${-svgPos!.y + 20}`)
        text.innerHTML = `(${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}, ${coord[2].toFixed(2)})`

        aLine.setAttribute('d', `M${(1 - coord[0]) * this.side / 2},${(1 - coord[0]) * this.side * SIN60}L${svgPos!.print()}`)
        bLine.setAttribute('d', `M${coord[1] * this.side},0L${svgPos!.print()}`)
        cLine.setAttribute('d', `M${this.side - svgPos!.y * TAN30},${svgPos!.y}L${svgPos!.print()}`)
      } else {
        text.setAttribute('x', '')
        text.setAttribute('y', '')
        text.innerHTML = ''

        aLine.setAttribute('d', '')
        bLine.setAttribute('d', '')
        cLine.setAttribute('d', '')
      }
    }
  }

  private storeEventListener(
    event: string, 
    el: Element, 
    handler: EventListenerOrEventListenerObject
  ) {
    if (!Object.hasOwn(this.eventListeners, event)) {
      this.eventListeners[event] = []
    }
    el.addEventListener(event, handler)
    this.eventListeners[event].push([el, handler])
  }
}