import { setAttributes, svgPath, svgPoly, removeElementsByClass, addChildElement } from 'utils/svg'
import Vector from 'utils/vector'

export class SVGTernaryPlot {
  private xmlns: string = 'http://www.w3.org/2000/svg'
  private margin: number = 0.1
  private side: number 
  private translate = new Vector(0, 0)
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private gridGroup: SVGGElement
  
  constructor(
    container: HTMLDivElement,
    size?: number,
    margin?: number) 
  {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    if (!size) size = Math.min(rect.width, rect.height)

    if (margin) this.margin = margin

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
    this.gridGroup = document.createElementNS(this.xmlns, 'g') as SVGGElement
    const gAttr = {
      id: 'plot-group',
      transform: this.transformMatrix(),
    }
    setAttributes(this.gridGroup, gAttr)
    this.svgElement.appendChild(this.gridGroup)
    
    this.drawTriangle()
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

  private drawTriangle(stroke='black') {

    const vertices = [
      new Vector(0, 0),
      new Vector(this.side, 0),
      new Vector(this.side/2, this.side * Math.sqrt(3)/2),
    ]
    const triangle = svgPoly(vertices)
    const attr = {
      points: triangle, fill: 'url(#grid-pattern)', stroke: stroke,
      'stroke-width': '2px', 'vector-effect': 'non-scaling-stroke'
    }

    addChildElement(this.gridGroup, 'polygon', attr)
  }
  
  public grid(division: number = 10) {
    const gridUnit = this.side / division

    // Pattern
    const attr = {
      id: 'grid-pattern', patternUnits: 'userSpaceOnUse',
      //patternTransform: this.transformMatrix(),
      width: `${gridUnit}`, height: `${Math.sqrt(3) * gridUnit}`,
    }
    const pattern = document.createElementNS(this.xmlns, 'pattern')
    setAttributes(pattern, attr)

    // Triangle grid
    const vertices = [
      new Vector(0, Math.sqrt(3) * gridUnit),
      new Vector(gridUnit, 0),
      new Vector(0, 0),
      new Vector(gridUnit, Math.sqrt(3) * gridUnit)
    ]
    let polyline = {
      points: svgPoly(vertices), fill: 'none',
      stroke: 'rgba(var(--color-text) / 0.2)', 'stroke-width': '1',
    }
    addChildElement(pattern, 'polyline', polyline)
    let line = {
      x1: '0', y1: `${gridUnit * Math.sqrt(3)/2}`, x2: `${gridUnit}`, y2: `${gridUnit * Math.sqrt(3)/2}`,
      stroke: 'rgba(var(--color-text) / 0.2)', 'stroke-width': '1',
    }
    addChildElement(pattern, 'line', line)

    this.svgDefs.appendChild(pattern)
  }
}
