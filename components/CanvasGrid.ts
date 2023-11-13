import {drawLine, setCanvasTransform, Line} from 'utils/canvas'
import EventListenerStore from 'utils/event'
import Vector from 'utils/vector'

/*
transform(scaleX, skewX, skewY, scaleY, translateX, translateY)
|a c e|
|b d f|
|0 0 1|
*/

export type ViewRange = {
  x: Vector,
  y: Vector
}

class CanvasGrid {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private transform = new DOMMatrix([1, 0, 0, 1, 0, 0])
  private viewRange: ViewRange = {
    x: new Vector(-10, 10),
    y: new Vector(-10, 10)
  }
  private eventListeners = new EventListenerStore()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.ctx.strokeStyle = '#ffffff'
  }

  drawAxes() {
    this.ctx.lineWidth = 2

    const transform = this.ctx.getTransform()
    
    const xAxisY = this.canvas.height/2 + transform.f
    if (xAxisY >= 0 || xAxisY <= this.canvas.height) {
      const xAxis: Line = {
        start: {x: -transform.e, y: xAxisY},
        end: {x: this.canvas.width - transform.e, y: xAxisY}
      }
      drawLine(this.ctx, xAxis)
    }
    const yAxisX = this.canvas.width/2 + transform.e
    if (yAxisX >= 0 || yAxisX <= this.canvas.width) {
      const yAxis: Line = {
        start: {x: yAxisX, y: -transform.f},
        end: {x: yAxisX, y: this.canvas.height - transform.f}
      }
      drawLine(this.ctx, yAxis)
    }
  }

  private drawGrid() {
    this.ctx.lineWidth = 1

  }

  private setViewTransform(width?: number, height?: number) {
    if (!width) width = this.canvas.width
    if (!height) height = this.canvas.height

    const viewLength = new Vector(
      this.viewRange.x.diff() as number, 
      this.viewRange.y.diff() as number
    )

    const transform = new DOMMatrix([
      width / viewLength.x,
      0, 0,
      height / viewLength.y,
      width * (-this.viewRange.x[0] / viewLength.x),
      height * (-this.viewRange.y[0] / viewLength.y),
    ])

    setCanvasTransform(this.ctx, transform)
  }

  private panOnDrag() {
    const dragButton = 1

    let oldPos: Vector | null

    const onClickBound = onClick.bind(this)
    this.eventListeners.storeEventListener('mousedown', this.canvas, onClickBound)

    function onClick(event: MouseEvent) {
      if (event.button !== dragButton) return

      event.preventDefault()
      
      // Click position
      oldPos = new Vector(event.clientX, event.clientY)

      this.canvas.addEventListener('mouseup', onMouseUp.bind(this))
      this.canvas.addEventListener('mousemove', onMouseMove.bind(this))
    }

    function onMouseMove(event: MouseEvent) {
      let newPos = new Vector(event.clientX, event.clientY)
      const transform = this.ctx.getTransform()

      if (!newPos || !oldPos) return
      let dist = {
        x: (oldPos.x - newPos.x) / transform.a,
        y: (oldPos.y - newPos.y) / transform.d
      }

      this.viewRange.x.addScalarInplace(dist.x)
      this.viewRange.y.addScalarInplace(dist.y)

      this.transformView(true)

      oldPos = new Vector(event.clientX, event.clientY)
    }

    function onMouseUp() {
    
      this.canvas.removeEventListener('mousemove', onMouseMove.bind(this))
      this.canvas.removeEventListener('mouseup', onMouseUp.bind(this))
    }
  }

  private draw() {

  }
}