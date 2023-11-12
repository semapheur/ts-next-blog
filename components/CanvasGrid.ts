import {drawLine, Line} from 'utils/canvas'

/*
transform(scaleX, skewX, skewY, scaleY, translateX, translateY)
|a c e|
|b d f|
|0 0 1|
*/

class CanvasGrid {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private transform = [1, 0, 0, 1, 0, 0]

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas
    this.ctx = ctx
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

  setTransform(matrix: number[]) {
    this.transform = matrix
    const [a, b, c, d, e, f] = matrix
    this.ctx.transform(a, b, c, d, e, f)
    this.ctx.getTransform()
  }
}