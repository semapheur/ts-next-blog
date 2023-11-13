import Vector from './vector'

type Point = {
  x: number,
  y: number
}

export type Line = {
  start: Point,
  end: Point 
}

export function drawLine(ctx: CanvasRenderingContext2D, line: Line) {
  ctx.beginPath()
  ctx.moveTo(line.start.x, line.start.y)
  ctx.lineTo(line.end.x, line.end.y)
  ctx.stroke()
}

export function setCanvasTransform(ctx: CanvasRenderingContext2D, matrix: DOMMatrix) {
  const {a, b, c, d, e, f} = matrix
  ctx.transform(a, b, c, d, e, f)
}

export function transformPoint(ctx: CanvasRenderingContext2D, point: Vector) {
  if (point.length != 2) return null

  return ctx.getTransform().invertSelf().transformPoint(new DOMPoint(point.x, point.y))
}