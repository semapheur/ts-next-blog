import {drawLine, Line} from 'utils/canvas'
import EventListenerStore from 'utils/event'
import { clamp, intervalLength } from 'utils/num'
import Vector from 'utils/vector'

type Axis = 'x'|'y'

export default class CanvasGrid {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private viewRange = {
    x: new Vector(-10, 10),
    y: new Vector(-10, 10)
  }
  private minGridScreenSize = 50
  private lastTime = 0
  private eventListeners = new EventListenerStore()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    this.squareGrids()
    this.panOnDrag()
  }

  public squareGrids() {
    const width = this.canvas.width
    const height = this.canvas.height

    
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
    this.ctx.strokeStyle = 'black'

    const transform = this.ctx.getTransform()
  
    this.ctx.lineWidth = 2 / transform.d
    const xAxis: Line = {
      start: {x: this.viewRange.x.x, y: 0},
      end: {x: this.viewRange.x.y, y: 0}
    }
    drawLine(this.ctx, xAxis)

    this.ctx.lineWidth = 2 / transform.a
    const yAxis: Line = {
      start: {x: 0, y: this.viewRange.y.x},
      end: {x: 0, y: this.viewRange.y.y}
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
      if (step < 0.01) return tick.toExponential(3)

      return tick.toFixed(0)
    }
    
    const unitIterate = (step: number, axis:Axis) => {
      this.ctx.lineWidth = axis === 'x' ? 0.5 / transform.a : 0.5 / -transform.d
      const fontSize = axis === 'x' ? 15 / transform.a : 15 / -transform.d
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
          start: {
            x: axis === 'x' ? this.viewRange.x[0] : tick, 
            y: axis === 'y' ? this.viewRange.y[0] : tick},
          end: {
            x: axis === 'x' ? this.viewRange.x[1] : tick, 
            y: axis === 'y' ? this.viewRange.y[1] : tick}
        }
        this.ctx.strokeStyle ='black'
        drawLine(this.ctx, line)
        const tickPos = {
          x: axis === 'y' ? tick + textOffset.grid : clamp(
            textOffset.edge, 
            this.viewRange.x[0] + textOffset.edge, 
            this.viewRange.x[1] - 3 * textOffset.edge),
          y: axis === 'x' ? tick + textOffset.grid : clamp(
            textOffset.edge,
            this.viewRange.y[0] - 3 * textOffset.edge,
            this.viewRange.y[1] + textOffset.edge
            )
        }
        this.ctx.fillStyle ='black'
        this.ctx.fillText(tickFormat(axis, step, tick), tickPos.x, tickPos.y)

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

  private drawTicks() {
  }

  private setTransform() {
    const viewLength = new Vector(
      this.viewRange.x.diff() as number, 
      this.viewRange.y.diff() as number
    )
    const transform = new DOMMatrix([
      this.canvas.width / viewLength.x,
      0, 0,
      this.canvas.height / viewLength.y,
      this.canvas.width * (-this.viewRange.x[0] / viewLength.x),
      this.canvas.height * (-this.viewRange.y[0] / viewLength.y),
    ])
    this.ctx.setTransform(transform)
  }

  private panOnDrag() {
    const dragButton = 1
    const rect = this.canvas.getBoundingClientRect()

    let startPos = new Vector(0,0)
    let isPanning = false

    const onClickBound = onClick.bind(this)
    this.eventListeners.storeEventListener('mousedown', this.canvas, onClickBound)

    function onClick(event: MouseEvent) {
      if (event.button !== dragButton) return

      isPanning = true
      event.preventDefault()
      
      // Click position
      startPos = new Vector(
        event.clientX - rect.left, 
        event.clientY - rect.top
      )
      this.canvas.addEventListener('mouseup', onMouseUp.bind(this))
      this.canvas.addEventListener('mousemove', onMouseMove.bind(this))
    }

    function onMouseMove(event: MouseEvent) {
      if (!isPanning) return

      const transform = this.ctx.getTransform()
      let panPos = new Vector(
        event.clientX - rect.left, 
        event.clientY - rect.top
      )
      let dist = {
        x: (startPos.x - panPos.x) / transform.a,
        y: (startPos.y - panPos.y) / transform.d
      }

      this.viewRange.x.addScalarInplace(dist.x)
      this.viewRange.y.addScalarInplace(dist.y)

      startPos = new Vector(
        event.clientX - rect.left, 
        event.clientY - rect.top
      )
    }

    function onMouseUp() {
      isPanning = false
      
      this.canvas.removeEventListener('mousemove', onMouseMove.bind(this))
      this.canvas.removeEventListener('mouseup', onMouseUp.bind(this))
    }
  }

  private clearCanvas() {
    const viewLength = new Vector(
      this.viewRange.x.diff() as number,
      this.viewRange.y.diff() as number
    )
    this.ctx.clearRect(this.viewRange.x[0], this.viewRange.y[0], viewLength.x, viewLength.y)
  }

  animate(timestamp: number) {
    //const deltaTime = timestamp - this.lastTime
    this.lastTime = timestamp

    this.setTransform()
    this.clearCanvas()
    this.drawGrid()
    this.drawAxes()

    requestAnimationFrame(this.animate.bind(this))
  }
}