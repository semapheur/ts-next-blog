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
  private minGridScreenSize = 50
  private eventListeners = new EventListenerStore()

  constructor(canvas: HTMLCanvasElement, matrix?: DOMMatrix, viewRange?: ViewRange, interactive = false) {
    this.ctx = canvas.getContext('2d')!

    if (matrix) this.ctx.setTransform(matrix)

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
    this.ctx.strokeStyle = 'white'

    const transform = this.ctx.getTransform()
  
    this.ctx.lineWidth = 2 / transform.d
    const xAxis: Line = {
      start: new DOMPoint(this.viewRange.x.x, 0),
      end: new DOMPoint(this.viewRange.x.y, 0)
    }
    drawLine(this.ctx, xAxis)

    this.ctx.lineWidth = 2 / transform.a
    const yAxis: Line = {
      start: new DOMPoint(0, this.viewRange.y.x),
      end: new DOMPoint(0, this.viewRange.y.y)
    }
    drawLine(this.ctx, yAxis)
  }

  private drawGrid() {

    const tickFormat = (axis: Axis, step: number, tick: number): string => {
      if (tick === 0) return '0'

      if (axis === 'x') {
        tick *= -1
      }

      if (step > 999) return tick.toExponential(0)
      if (step < 1) return tick.toFixed(1)
      if (step < 0.1) return tick.toFixed(2)
      if (step < 0.01) return tick.toExponential(1)

      return tick.toFixed(0)
    }
    
    const unitIterate = (step: number, axis:Axis) => {
      this.ctx.lineWidth = axis === 'x' ? 0.5 / transform.a : 0.5 / transform.d
      const fontSize = axis === 'x' ? 15 / transform.a : 15 / transform.d
      this.ctx.font = `bold ${fontSize}px trebuchet ms`
      this.ctx.textAlign = axis === 'x' ? 'start' : 'center'
      const textOffset = {
        edge: axis === 'x' ? 5 / transform.a : 5 / -transform.d,
        grid: axis === 'x' ? 5 / transform.a : 0,
      }

      let tick = axis === 'x' ? this.viewRange.y[0] : this.viewRange.x[0]
      const stop = axis === 'x' ? this.viewRange.y[1] : this.viewRange.x[1]

      const remainder = tick % step
      if (remainder !== 0) {
          tick += (remainder < 0) ? -remainder : step - remainder
      }

      while (tick < stop) {
        if (tick === 0) {
          tick += step
          continue
        }
        const line: Line = {
          start: DOMPoint.fromPoint({
            x: axis === 'x' ? this.viewRange.x[0] : tick, 
            y: axis === 'y' ? this.viewRange.y[0] : tick}),
          end: DOMPoint.fromPoint({
            x: axis === 'x' ? this.viewRange.x[1] : tick, 
            y: axis === 'y' ? this.viewRange.y[1] : tick})
        }
        drawLine(this.ctx, line, 'white')

        const tickPos = {
          x: axis === 'y' ? tick + textOffset.grid : clamp(
            textOffset.edge, 
            this.viewRange.x[0] + textOffset.edge, 
            this.viewRange.x[1] - 3 * textOffset.edge),
          y: axis === 'x' ? tick + textOffset.grid : clamp(
            textOffset.edge,
            this.viewRange.y[0] - 3 * textOffset.edge,
            this.viewRange.y[1] + textOffset.edge)
        }
        this.ctx.fillStyle ='white'
        this.ctx.strokeStyle ='black'
        this.ctx.fillText(tickFormat(axis, step, tick), tickPos.x, tickPos.y)
        this.ctx.strokeText(tickFormat(axis, step, tick), tickPos.x, tickPos.y)

        tick += step
      }
    }
    const transform = this.ctx.getTransform()
    const min = [
      this.minGridScreenSize / transform.a,
      this.minGridScreenSize / transform.d
    ]
    const gridUnit = new Vector(
      intervalLength(min[0])!,
      intervalLength(min[1])!
    )
    for (const [index, key] of ['x', 'y'].entries()) {
      unitIterate(gridUnit[index], key as Axis)
    }
  }

  private setTransform() {
    const {width, height} = this.ctx.canvas.getBoundingClientRect()
    const viewLength = new Vector(
      this.viewRange.x.diff() as number, 
      this.viewRange.y.diff() as number
    )
    const matrix = new DOMMatrix([
      width / viewLength.x,
      0, 0,
      height / viewLength.y,
      width * (-this.viewRange.x[0] / viewLength.x),
      height * (-this.viewRange.y[0] / viewLength.y),
    ])
    this.ctx.setTransform(matrix)
  }

  private transformView() {
    const matrix = this.ctx.getTransform()

    const {width, height} = this.ctx.canvas.getBoundingClientRect()

    const bottomLeft = screenToDrawPosition(new DOMPoint(0, 0), matrix)
    const topRight = screenToDrawPosition(new DOMPoint(width, height), matrix)

    this.viewRange = {
      x: new Vector(bottomLeft.x, topRight.x),
      y: new Vector(bottomLeft.y, topRight.y)
    }
    console.log(this.viewRange.y)
  }

  updateTransform(matrix: DOMMatrix) {
    this.ctx.setTransform(matrix)
  }

  private panOnDrag() {
    const dragButton = 1

    let startPos = new DOMPoint(0, 0)
    let isPanning = false

    const matrix = this.ctx.getTransform()
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

      matrix.e += event.clientX - startPos.x
      matrix.f += event.clientY - startPos.y
      this.ctx.setTransform(matrix)

      startPos = new DOMPoint(event.clientX, event.clientY)
    }

    function onMouseUp() {
      isPanning = false
      
      this.ctx.canvas.removeEventListener('mousemove', onMouseMove.bind(this))
      this.ctx.canvas.removeEventListener('mouseup', onMouseUp.bind(this))
    }
  }

  private zoomOnWheel() {
    const matrix: DOMMatrix = this.ctx.getTransform()
    const onWheelBound = onWheel.bind(this)
    this.eventListeners.storeEventListener('wheel', this.ctx.canvas, onWheelBound)

    function onWheel(event: WheelEvent) {
      
      const zoomPos = mousePosition(this.ctx.canvas, event)
      
      if (!(zoomPos && matrix)) return

      const zoomFactor = 1 + Math.sign(-event.deltaY) * 0.1

      matrix.a *= zoomFactor
      matrix.d *= zoomFactor
      matrix.e = zoomPos.x + (matrix.e - zoomPos.x) * zoomFactor
      matrix.f = zoomPos.y + (matrix.f - zoomPos.y) * zoomFactor
      
      this.ctx.setTransform(matrix)
    }
  }

  private clearCanvas() {
    const viewLength = new Vector(
      this.viewRange.x.diff() as number,
      this.viewRange.y.diff() as number
    )
    this.ctx.clearRect(this.viewRange.x[0], this.viewRange.y[0], viewLength.x, viewLength.y)
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