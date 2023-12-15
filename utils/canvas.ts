import {Line} from './types'

export function drawLine(ctx: CanvasRenderingContext2D, line: Line, color?: string) {
  if (color) {
    ctx.strokeStyle = color
  }

  ctx.beginPath()
  ctx.moveTo(line.start.x, line.start.y)
  ctx.lineTo(line.end.x, line.end.y)
  ctx.stroke()
}

export function setCanvasTransform(ctx: CanvasRenderingContext2D, matrix: DOMMatrix) {
  ctx.setTransform({...matrix})
}

export function transformPoint(ctx: CanvasRenderingContext2D, point: DOMPoint) {
  return ctx.getTransform().invertSelf().transformPoint(point)
}

export function mousePosition(
  canvas: HTMLCanvasElement, 
  event: MouseEvent
): DOMPoint {
  const {left, top} = canvas.getBoundingClientRect()
  return new DOMPoint(
    event.clientX - left, 
    event.clientY - top
  )
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const {width, height} = canvas.getBoundingClientRect()

  if (canvas.width !== width) {
    canvas.width = width
  } 
  
  if (canvas.height !== height) {
    canvas.height = height
  }
}