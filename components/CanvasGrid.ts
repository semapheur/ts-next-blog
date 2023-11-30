import {drawLine, mousePosition} from 'utils/canvas'
import EventListenerStore from 'utils/event'
import { clamp, intervalLength } from 'utils/num'
import { screenToDrawPosition } from 'utils/svg'
import { Line, ViewRange } from 'utils/types'
import Vector from 'utils/vector'

type Axis = 'x'|'y'

export default class CanvasGrid {
  private ctx: CanvasRenderingContext2D
  private viewRange: ViewRange
  private transform: DOMMatrix
  private minGridSize = 50
  private eventListeners = new EventListenerStore()
  private complex: Boolean

  constructor(
    canvas: HTMLCanvasElement, 
    transform?: DOMMatrix, 
    viewRange?: ViewRange, 
    interactive = false, 
    complex = false
  ) {
    this.complex = complex

    this.ctx = canvas.getContext('2d')!

    if (transform) this.transform = transform

    if (viewRange) {
      this.viewRange = viewRange
      this.squareGrids()
      this.setTransform()
    }

    if (interactive) {
      this.panOnDrag()
      this.zoomOnWheel()
    }
  }

  public squareGrids() {
    const {width, height} = this.ctx.canvas.getBoundingClientRect()

    const viewLength = new Vector(
      this.viewRange.x.diff() as number, 
      this.viewRange.y.diff() as number
    )

    if (width < height) {
      const aspect = width / height
      const xLength = viewLength.y * aspect

      this.viewRange.x = new Vector(
        this.viewRange.x.mean - xLength/2,
        this.viewRange.x.mean + xLength/2
      )
    } else if (width > height) {
      const aspect = height / width
      const yLength = viewLength.x * aspect

      this.viewRange.y = new Vector(
        this.viewRange.y.mean - yLength/2,
        this.viewRange.y.mean + yLength/2
      )
    } else {
      const deltaLength = viewLength.diff() as number
      if (deltaLength < 0) {
        this.viewRange.x = new Vector(
          this.viewRange.x.mean - viewLength.y / 2,
          this.viewRange.x.mean + viewLength.y / 2
        )
      } else if (deltaLength > 0) {
        this.viewRange.y = new Vector(
          this.viewRange.y.mean - viewLength.x / 2,
          this.viewRange.y.mean + viewLength.x / 2
        )
      }
    }
  }

  drawAxes() {
    const {width, height} = this.ctx.canvas.getBoundingClientRect()
    this.ctx.strokeStyle = 'white'
  
    this.ctx.lineWidth = 2
    const xAxis: Line = {
      start: new DOMPoint(0, this.transform.f),
      end: new DOMPoint(width, this.transform.f)
    }
    drawLine(this.ctx, xAxis)

    const yAxis: Line = {
      start: new DOMPoint(this.transform.e, 0),
      end: new DOMPoint(this.transform.e, height)
    }
    drawLine(this.ctx, yAxis)
  }

  private drawGrid() {

    const tickFormat = (axis: Axis, step: number, tick: number): string => {
      if (tick === 0) return '0'

      if (axis === 'y') {
        tick *= -1
      }

      if (step > 999) return tick.toExponential(0)
      if (step < 0.01) return tick.toExponential(1)
      if (step < 0.1) return tick.toFixed(2)
      if (step < 1) return tick.toFixed(1)

      return tick.toFixed(0)
    }
    
    const unitIterate = (step: number, axis: Axis) => {
      const {width, height} = this.ctx.canvas.getBoundingClientRect()

      this.ctx.lineWidth = 1
      this.ctx.font = `bold 1rem trebuchet ms`
      this.ctx.textAlign = axis === 'x' ? 'center' : 'start'
      this.ctx.textBaseline = axis === 'x' ? 'bottom' : 'middle'
      const textOffset = {
        edge: 5,
        grid: axis === 'x' ? 5 : 0
      }

      let tick = axis === 'x' ? this.viewRange.x[0] : this.viewRange.y[0]
      const stop = axis === 'x' ? this.viewRange.x[1] : this.viewRange.y[1]

      const remainder = tick % step
      if (remainder !== 0) {
        tick += (remainder < 0) ? -remainder : step - remainder
      }
      
      while (tick < stop) {
        if (tick === 0) {
          tick += step
          continue
        }
        
        const screenTick = axis === 'x' ?
          (tick * this.transform.a) + this.transform.e :
          (tick * this.transform.d) + this.transform.f

        const line: Line = {
          start: DOMPoint.fromPoint({
            x: axis === 'x' ? screenTick : 0, 
            y: axis === 'y' ? screenTick : 0}),
          end: DOMPoint.fromPoint({
            x: axis === 'x' ? screenTick : width, 
            y: axis === 'y' ? screenTick : height})
        }
        drawLine(this.ctx, line, 'white')

        const tickPos = {
          x: axis === 'x' ? screenTick : clamp(
            this.transform.e, 
            0 + textOffset.edge, 
            width - 3 * textOffset.edge),
          y: axis === 'y' ? screenTick : clamp(
            this.transform.f,
            3 * textOffset.edge,
            height - textOffset.edge)
        }
        this.ctx.fillStyle ='white'
        this.ctx.strokeStyle ='black'
        this.ctx.lineWidth = 0.5
        let text = (axis === 'y' && this.complex) ? 
          tickFormat(axis, step, tick) + 'i' :
          tickFormat(axis, step, tick)
        
        this.ctx.fillText(text, tickPos.x, tickPos.y)
        this.ctx.strokeText(text, tickPos.x, tickPos.y)

        tick += step
      }
    }

    const gridUnit = {
      x: intervalLength(this.minGridSize / this.transform.a),
      y: intervalLength(this.minGridSize / this.transform.d)
    }
  
    for (const axis of ['x', 'y']) {
      unitIterate(gridUnit[axis], axis as Axis)
    }
  }

  private setTransform() {
    const {width, height} = this.ctx.canvas.getBoundingClientRect()
    const viewLength = new Vector(
      this.viewRange.x.diff() as number, 
      this.viewRange.y.diff() as number
    )
    this.transform = new DOMMatrix([
      width / viewLength.x,
      0, 0,
      height / viewLength.y,
      width * (-this.viewRange.x[0] / viewLength.x),
      height * (-this.viewRange.y[0] / viewLength.y),
    ])
  }

  private transformView() {
    const {width, height} = this.ctx.canvas.getBoundingClientRect()

    const bottomLeft = screenToDrawPosition(new DOMPoint(0, 0), this.transform)
    const topRight = screenToDrawPosition(new DOMPoint(width, height), this.transform)

    this.viewRange = {
      x: new Vector(bottomLeft.x, topRight.x),
      y: new Vector(bottomLeft.y, topRight.y)
    }
  }

  updateTransform(matrix: DOMMatrix) {
    this.transform = matrix
  }

  private panOnDrag() {
    const dragButton = 1

    let startPos = new DOMPoint(0, 0)
    let isPanning = false

    const onClickBound = onClick.bind(this)
    this.eventListeners.storeEventListener('mousedown', this.ctx.canvas, onClickBound)

    function onClick(event: MouseEvent) {
      if (event.button !== dragButton) return

      isPanning = true
      event.preventDefault()
      
      // Click position
      startPos = new DOMPoint(event.clientX, event.clientY)
      this.ctx.canvas.addEventListener('mouseup', onMouseUp.bind(this))
      this.ctx.canvas.addEventListener('mousemove', onMouseMove.bind(this))
    }

    function onMouseMove(event: MouseEvent) {
      if (!isPanning) return

      this.transform.e += event.clientX - startPos.x
      this.transform.f += event.clientY - startPos.y

      startPos = new DOMPoint(event.clientX, event.clientY)
    }

    function onMouseUp() {
      isPanning = false
      
      this.ctx.canvas.removeEventListener('mousemove', onMouseMove.bind(this))
      this.ctx.canvas.removeEventListener('mouseup', onMouseUp.bind(this))
    }
  }

  private zoomOnWheel() {
    const onWheelBound = onWheel.bind(this)
    this.eventListeners.storeEventListener('wheel', this.ctx.canvas, onWheelBound)

    function onWheel(event: WheelEvent) {
      
      const zoomPos = mousePosition(this.ctx.canvas, event)
      
      const zoomFactor = 1 + Math.sign(-event.deltaY) * 0.1

      this.transform.a *= zoomFactor
      this.transform.d *= zoomFactor
      this.transform.e = zoomPos.x + (this.transform.e - zoomPos.x) * zoomFactor
      this.transform.f = zoomPos.y + (this.transform.f - zoomPos.y) * zoomFactor
    }
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }

  draw() {
    this.transformView()
    this.clearCanvas()
    this.drawGrid()
    this.drawAxes()
  }

  animate(timestamp: number) {
    this.draw()

    requestAnimationFrame(this.animate.bind(this))
  }
}