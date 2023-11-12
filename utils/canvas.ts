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