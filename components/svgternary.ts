import { action, computed, makeObservable, observable } from 'mobx';
import { setAttributes, svgPoly, mousePosition, addChildElement } from 'utils/svg'
import { betaPDF } from 'utils/probability'
import Vector from 'utils/vector'
import EventListenerStore from 'utils/event'

const SIN60 = Math.sqrt(3) / 2
const TAN30 = Math.sqrt(3) / 3
const THIRD = 1/3

function printPoint(p: DOMPoint) {
  return `${p.x},${p.y}`
}

type TernaryState = {
  point: DOMPoint,
  director: number
}

export class TernaryStore {
  public point: DOMPoint
  public director: number

  constructor(point?: DOMPoint, director?: number) {
    if (point) this.point = point
    if (director) this.director = director

    makeObservable(this, {
      point: observable,
      director: observable,
      setPoint: action,
      setDirector: action,
    })
  }

  public setPoint(point: DOMPoint) {
    this.point = point
  }

  public setDirector(director: number) {
    this.director = director
  }
}

export class Opinion extends TernaryStore {
  constructor(point: DOMPoint, director: number) {
    super(point, director)

    makeObservable(this, {
      belief: computed,
      disbelief: computed,
      uncertainty: computed,
      baseRate: computed,
      probability: computed,
      distribution: computed
    })
  }
  get belief() {
    return this.point.y
  }
  get disbelief() {
    return this.point.x
  }
  get uncertainty() {
    return this.point.z
  }
  get baseRate() {
    return this.director
  }
  get probability() {
    return this.point.y + this.point.z * this.director
  }
  get distribution() {
    const alpha = 2 * (this.belief / this.uncertainty + this.baseRate)
    const beta = 2 * (this.disbelief / this.uncertainty + (1 - this.baseRate))

    const x = Vector.linspace(0, 1, 1000).toArray()

    const points = Array<[number, number]>(x.length)

    for (let i=0; i < x.length; i++) {
      points[i] = [x[i], betaPDF(x[i], alpha, beta)]
    }
    return points
  }
}

export default class SVGTernaryPlot {
  private xmlns = 'http://www.w3.org/2000/svg'
  private margin = 0.1
  private side: number
  private translate = new DOMPoint(0, 0)
  private colors = {
    axis: {a: 'red', b: 'green', c: 'blue'},
    director: 'orange',
    point: 'black'
  }
  private state: TernaryState
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private frameGroup: SVGGElement
  private eventListeners = new EventListenerStore()
  private idPrefix = 'ternary'

  constructor(
    container: HTMLDivElement,
    initialState: TernaryState = {point: new DOMPoint(THIRD, THIRD, THIRD), director: 0.5},
    size?: number,
    margin?: number,
    axisColors?: string[],
    directorColor?: string,
    pointColor?: string,
    idPrefix?: string
  ) {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    if (!size) size = Math.min(rect.width, rect.height)

    if (margin) this.margin = margin

    if (initialState) this.state = initialState

    if (idPrefix) this.idPrefix = idPrefix

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
    const gAttr = {
      id: `${this.idPrefix}-frame-group`,
      transform: this.transformMatrix(),
    }
    setAttributes(this.frameGroup, gAttr)
    this.svgElement.appendChild(this.frameGroup)

    addChildElement(this.frameGroup, 'g', { id: `${this.idPrefix}-grid-group` })
    addChildElement(this.frameGroup, 'g', { id: `${this.idPrefix}-axis-group` })
    addChildElement(this.frameGroup, 'g', { id: `${this.idPrefix}-crosshair-group` })
    addChildElement(this.frameGroup, 'g', { id: `${this.idPrefix}-director-group` })
    addChildElement(this.frameGroup, 'g', { id: `${this.idPrefix}-plot-group` })

    this.drawTriangle()

    // Add functionality
    this.crosshair()
  }

  public cleanup() {
    // Cleanup bound event handlers
    for (const event in this.eventListeners) {
      for (const [el, handler] of this.eventListeners[event]) {
        el.removeEventListener(event, handler)
      }
    }
    // Remove svg
    //this.svgElement.parentNode?.removeChild(this.svgElement)
  }

  public getSvg(): SVGSVGElement {
    return this.svgElement
  }

  public getValue(): TernaryState {
    return this.state
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
    const grid = document.getElementById(`${this.idPrefix}-grid-group`)
    if (!grid) return

    const vertices = [
      new Vector(0, 0),
      new Vector(this.side, 0),
      new Vector(this.side / 2, this.side * SIN60),
    ]
    const triangle = svgPoly(vertices)
    const attr = {
      id: `${this.idPrefix}-polygon`,
      points: triangle, fill: `url(#${this.idPrefix}-grid-pattern)`, stroke: stroke,
      'stroke-width': '2px', 'vector-effect': 'non-scaling-stroke'
    }

    addChildElement(grid, 'polygon', attr)
  }

  public grid(division = 10) {
    const gridUnit = this.side / division

    // Pattern
    const attr = {
      id: `${this.idPrefix}-grid-pattern`, patternUnits: 'userSpaceOnUse',
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
    const polyline = {
      points: svgPoly(vertices), fill: 'none',
      stroke: 'rgb(var(--color-text) / 0.2)', 'stroke-width': '1',
    }
    addChildElement(pattern, 'polyline', polyline)
    const line = {
      x1: '0', y1: `${gridUnit * SIN60}`,
      x2: `${gridUnit}`, y2: `${gridUnit * SIN60}`,
      stroke: 'rgb(var(--color-text) / 0.2)', 'stroke-width': '1',
    }
    addChildElement(pattern, 'line', line)
    this.svgDefs.appendChild(pattern)
  }

  public axis() {
    const axis = document.getElementById(`${this.idPrefix}-axis-group`)
    if (!axis) return

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
    return this.state.point.y + this.state.director * this.state.point.z
  }

  public point(newPoint?: DOMPoint, store?: TernaryStore) {

    if (newPoint) this.state.point = newPoint

    const svgPos = this.ternaryToSvgPosition(this.state.point)
    const plot = document.getElementById(`${this.idPrefix}-plot-group`)
    if (!plot) return

    const circle = document.createElementNS(this.xmlns, 'circle') as SVGCircleElement
    circle.style.cursor = 'move'
    const attr = {
      id: `${this.idPrefix}-plot-point`, cx: `${svgPos.x}`, cy: `${svgPos.y}`, r: '0.5rem',
      fill: this.colors.point
    }
    setAttributes(circle, attr)
    plot.appendChild(circle)

    const line = {
      id: `${this.idPrefix}-plot-projector`, x1: `${svgPos.x}`, y1: `${svgPos.y}`,
      x2: `${this.projector() * this.side}`, y2: '0', stroke: this.colors.point, 
      'stroke-width': '1', 'stroke-dasharray': '5'
    }
    addChildElement(plot, 'line', line)

    //const dragButton = 0
    let dragged: boolean
    const onClickBound = onClick.bind(this, store)
    this.eventListeners.storeEventListener('pointerdown', circle, onClickBound)

    function onClick(store?: TernaryStore) {
      dragged = true

      this.svgElement.addEventListener('pointermove', onDrag.bind(this, store))
      this.svgElement.addEventListener('pointerup', endDrag.bind(this))
    }

    function onDrag(store: TernaryStore|undefined, event: PointerEvent) {
      if (!dragged) return

      const point = document.getElementById(`${this.idPrefix}-plot-point`)
      const projector = document.getElementById(`${this.idPrefix}-plot-projector`)
      if (!(point && projector)) return

      event.preventDefault()
      const svgPos = mousePosition(this.svgElement, event)
      if (!svgPos) return

      svgPos.x -= this.translate.x
      svgPos.y = -svgPos.y + this.translate.y

      if (!this.inTriangle(svgPos)) return

      setAttributes(point, {cx: `${svgPos.x}`, cy: `${svgPos.y}`})
      this.state.point = this.svgToTernaryPosition(svgPos)
      setAttributes(projector, {
        x1: `${svgPos.x}`, y1: `${svgPos.y}`, 
        x2: `${this.projector() * this.side}`
      })

      if (store) store.setPoint(this.state.point)
    }

    function endDrag() {
      dragged = false
      this.svgElement.removeEventListener('pointermove', onDrag.bind(this, store))
      this.svgElement.removeEventListener('pointerup', endDrag.bind(this))
    }
  }

  public director(newDirector?: number, store?: TernaryStore) {
    if (newDirector) this.state.director = newDirector

    const director = document.getElementById(`${this.idPrefix}-director-group`)
    if (!director) return

    const circle = document.createElementNS(this.xmlns, 'circle') as SVGCircleElement
    circle.style.cursor = 'ew-resize'
    const attr = {
      id: `${this.idPrefix}-director-point`, cx: `${this.side * this.state.director}`, cy: '0', r: '0.5rem',
      fill: this.colors.director
    }
    setAttributes(circle, attr)
    director.appendChild(circle)

    const line = {
      id: `${this.idPrefix}-director-line`, x1: `${this.side / 2}`, y1: `${this.side * SIN60}`,
      x2: `${this.side * this.state.director}`, y2: '0', 
      stroke: this.colors.director, 'stroke-width': '1',
      'stroke-dasharray': '5'
    }
    addChildElement(director, 'line', line)

    let dragged: boolean
    const onClickBound = onClick.bind(this, store)
    this.eventListeners.storeEventListener('pointerdown', circle, onClickBound)

    function onClick(store?: TernaryStore) {
      dragged = true

      this.svgElement.addEventListener('pointermove', onDrag.bind(this, store))
      this.svgElement.addEventListener('pointerup', endDrag.bind(this))
    }

    function onDrag(store: TernaryStore|undefined, event: PointerEvent) {
      if (!dragged) return

      event.preventDefault()
      const svgPos = mousePosition(this.svgElement, event)
      if (!svgPos) return

      svgPos.x -= this.translate.x
      svgPos.y += this.translate.y

      if (svgPos.x < 0 || svgPos.x > this.side) return

      const point = document.getElementById(`${this.idPrefix}-director-point`)
      const director = document.getElementById(`${this.idPrefix}-director-line`)
      const projector = document.getElementById(`${this.idPrefix}-plot-projector`)

      point?.setAttribute('cx', `${svgPos.x}`)
      director?.setAttribute('x2', `${svgPos.x}`)
      projector?.setAttribute('x2', `${this.projector() * this.side}`)

      this.state.director = svgPos.x / this.side

      if (store) store.setDirector(this.state.director)
    }

    function endDrag() {
      dragged = false
      this.svgElement.removeEventListener('pointermove', onDrag.bind(this, store))
      this.svgElement.removeEventListener('pointerup', endDrag.bind(this))
    }
  }

  private svgToTernaryPosition(svgPos: DOMPoint): DOMPoint {
    const a = 1 - (svgPos.x + svgPos.y * TAN30) / this.side
    const b = (svgPos.x - svgPos.y * TAN30) / this.side
    const c = svgPos.y / (this.side * SIN60)

    return new DOMPoint(a, b, c)
  }

  private ternaryToSvgPosition(ternary: DOMPoint): DOMPoint {
    return new DOMPoint(
      this.side * (ternary.y + ternary.z * SIN60 * TAN30), 
      ternary.z * (this.side * SIN60)
    )
  }

  private inTriangle(svgPos: DOMPoint | null): boolean {
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
    const crosshair = document.getElementById(`${this.idPrefix}-crosshair-group`)
    if (!crosshair) return

    // Coordinate crosshair text
    const attr = {
      id: `${this.idPrefix}-crosshair-text`,
      'font-size': '0.75em',
      fill: 'rgb(var(--color-text) / 1)',
      transform: 'scale(1, -1)'
    }
    addChildElement(crosshair, 'text', attr)

    // Coordinate crosshair lines
    const path = {
      id: `${this.idPrefix}-crosshair-line-a`, d: '',
      stroke: this.colors.axis.a, 'stroke-width': '1px', 'stroke-dasharray': '5px',
      opacity: '0.5', 'vector-effect': 'non-scaling-stroke',
    }
    addChildElement(crosshair, 'path', path)

    path['id'] = `${this.idPrefix}-crosshair-line-b`
    path['stroke'] = this.colors.axis.b
    addChildElement(crosshair, 'path', path)

    path['id'] = `${this.idPrefix}-crosshair-line-c`
    path['stroke'] = this.colors.axis.c
    addChildElement(crosshair, 'path', path)

    const onPointerMoveBound = onPointerMove.bind(this)
    this.eventListeners.storeEventListener('pointermove', this.frameGroup, onPointerMoveBound)

    function onPointerMove(event: PointerEvent) {

      const svgPos = mousePosition(this.frameGroup, event)
      if (!svgPos) return

      const text = document.getElementById(`${this.idPrefix}-crosshair-text`)
      const aLine = document.getElementById(`${this.idPrefix}-crosshair-line-a`)
      const bLine = document.getElementById(`${this.idPrefix}-crosshair-line-b`)
      const cLine = document.getElementById(`${this.idPrefix}-crosshair-line-c`)
      if (!(text && aLine && bLine && cLine)) return

      if (this.inTriangle(svgPos)) {
        const coord = this.svgToTernaryPosition(svgPos)

        text.setAttribute('x', `${svgPos.x + 15}`)
        text.setAttribute('y', `${-svgPos.y + 20}`)
        text.innerHTML = `(${coord.x.toFixed(2)}, ${coord.y.toFixed(2)}, ${coord.z.toFixed(2)})`

        aLine.setAttribute('d', `M${(1 - coord.x) * this.side / 2},${(1 - coord.x) * this.side * SIN60}L${printPoint(svgPos)}`)
        bLine.setAttribute('d', `M${coord.y * this.side},0L${printPoint(svgPos)}`)
        cLine.setAttribute('d', `M${this.side - svgPos.y * TAN30},${svgPos.y}L${printPoint(svgPos)}`)
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
}