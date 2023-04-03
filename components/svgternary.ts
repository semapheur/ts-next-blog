import { setAttributes, svgPath, removeElementsByClass, addChildElement } from 'utils/svg'
import Vector from 'utils/vector'

export class SVGTernaryPlot {
  private xmlns: string = 'http://www.w3.org/2000/svg'
  private size: number
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private plotGroup: SVGGElement
  
  constructor(
    container: HTMLDivElement, 
    size?: number) 
  {
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    if (!size) size = Math.min(rect.width, rect.height)
    this.size = size

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

    this.drawTriangle()
  }

  private drawTriangle(margin: number = 0.1, stroke='black') {
    const s = this.size * (1 - 2*margin)
    const h = (Math.sqrt(3)/2) * s
    const center = this.size * 0.5
    const marginSize = this.size * margin

    const vertices = [
      new Vector(center, marginSize),
      new Vector(center + s/2, h + marginSize),
      new Vector(center - s/2, h + marginSize)
    ]

    const path = svgPath(vertices, true)
    const attr = {
      d: path, fill: 'none', stroke: stroke,
      'stroke-width': '2px', 'vector-effect': 'non-scaling-stroke'
    }

    addChildElement(this.svgElement, 'path', attr)
  }

}