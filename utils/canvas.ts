import {Line, Vec2} from './types'

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

export function transformPoint(ctx: CanvasRenderingContext2D, point: Vec2) {
  return ctx.getTransform().invertSelf().transformPoint(new DOMPoint(point.x, point.y))
}

export function mousePosition(
  canvas: HTMLCanvasElement, 
  event: MouseEvent
): Vec2 {
  const {left, top} = canvas.getBoundingClientRect()
  return {
    x: event.clientX - left, 
    y: event.clientY - top
  }
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio
  const {width, height} = canvas.getBoundingClientRect()
  const newWidth = Math.round(width * dpr)
  const newHeight = Math.round(height * dpr)

  if (canvas.width !== newWidth) {
    canvas.width = newWidth
  } 
  
  if (canvas.height != newHeight) {
    canvas.height = newHeight
  }
  
}