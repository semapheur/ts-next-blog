import {drawLine, setCanvasTransform, Line, transformPoint} from 'utils/canvas'
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

export default class CanvasGrid {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private viewRange: ViewRange = {
    x: new Vector(-10, 10),
    y: new Vector(-10, 10)
  }
  private eventListeners = new EventListenerStore()

  constructor(canvas: HTMLCanvasElement, aspect: number = 1) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    this.squareGrids()
    
    this.setTransform()

    this.drawAxes()
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
        this.viewRange.x.mean + xLength/2,
        this.viewRange.x.mean - xLength/2
      )
    } else if (width > height) {
      const aspect = height / width
      const yLength = viewLength.x * aspect

      this.viewRange.y = new Vector(
        this.viewRange.y.mean + yLength/2,
        this.viewRange.y.mean - yLength/2
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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    //this.ctx.fillRect(0, 0, 1, 1)
    
    const transform = this.ctx.getTransform()
    console.log(this.viewRange.x)

    this.ctx.lineWidth = 2 / -transform.d
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
    this.ctx.lineWidth = 1

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

    setCanvasTransform(this.ctx, transform)
  }

  private panOnDrag() {
    const dragButton = 1
    const rect = this.canvas.getBoundingClientRect()
    const transform = this.ctx.getTransform()

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
      let panPos = new Vector(
        event.clientX - rect.left, 
        event.clientY - rect.top
      )
      
      if (!isPanning) return

      let dist = {
        x: (startPos.x - panPos.x) / transform.a,
        y: (startPos.y - panPos.y) / transform.d
      }

      this.viewRange.x.addScalarInplace(dist.x)
      this.viewRange.y.addScalarInplace(dist.y)
    }

    function onMouseUp() {
      isPanning = false
      this.setTransform()
      this.drawAxes()
      this.canvas.removeEventListener('mousemove', onMouseMove.bind(this))
      this.canvas.removeEventListener('mouseup', onMouseUp.bind(this))
    }
  }
}