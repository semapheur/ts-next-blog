import Vector from 'lib/utils/vector'

function catmullRomSpline(
  p0: Vector,
  p1: Vector,
  p2: Vector,
  p3: Vector,
  numPoints: number,
  alpha = 0.5,
): Vector[] {
  if (
    p0.length !== p1.length ||
    p1.length !== p2.length ||
    p2.length !== p3.length
  ) {
    throw new Error('Spline points must have same dimension')
  }

  function tj(ti: number, pi: Vector, pj: Vector) {
    return ti + Vector.distance(pj, pi)! ** alpha
  }

  const t0 = 0.0
  const t1 = tj(t0, p0, p1)
  const t2 = tj(t1, p1, p2)
  const t3 = tj(t2, p2, p3)

  const t = Vector.linspace(t1, t2, numPoints)

  // a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
  const a1: Vector[] = Vector.add(
    t
      .negate()
      .addScalar(t1)
      .scale(1 / (t1 - t0))
      .outer(p0),
    t
      .addScalar(-t0)
      .scale(1 / (t1 - t0))
      .outer(p1),
  )
  // a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
  const a2: Vector[] = Vector.add(
    t
      .negate()
      .addScalar(t2)
      .scale(1 / (t2 - t1))
      .outer(p1),
    t
      .addScalar(-t1)
      .scale(1 / (t2 - t1))
      .outer(p2),
  )
  // a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
  const a3: Vector[] = Vector.add(
    t
      .negate()
      .addScalar(t3)
      .scale(1 / (t3 - t2))
      .outer(p2),
    t
      .addScalar(-t2)
      .scale(1 / (t3 - t2))
      .outer(p3),
  )
  // b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2
  const b1: Vector[] = Vector.add(
    t
      .negate()
      .addScalar(t2)
      .scale(1 / (t2 - t0))
      .multiply(...a1),
    t
      .addScalar(-t0)
      .scale(1 / (t2 - t0))
      .multiply(...a2),
  )
  // b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
  const b2: Vector[] = Vector.add(
    t
      .negate()
      .addScalar(t3)
      .scale(1 / (t3 - t1))
      .multiply(...a2),
    t
      .addScalar(-t1)
      .scale(1 / (t3 - t1))
      .multiply(...a3),
  )
  // points = (t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2
  return Vector.add(
    t
      .negate()
      .addScalar(t2)
      .scale(1 / (t2 - t1))
      .multiply(...b1),
    t
      .addScalar(-t1)
      .scale(1 / (t2 - t1))
      .multiply(...a2),
  )
}

export function catmullRom(
  points: Vector[],
  numPoints: number,
  loop = false,
  alpha = 0.5,
): Vector[] {
  if (loop) {
    const start = points[0]
    const end = points[points.length - 1]

    !start.equal(end) && points.push(start)

    points.unshift(points[0])
    points.push(points[points.length - 1])
  }

  const curve: Vector[] = []

  for (let i = 0; i + 3 < points.length; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const p2 = points[i + 2]
    const p3 = points[i + 3]
    curve.push(...catmullRomSpline(p0, p1, p2, p3, numPoints, alpha))
  }

  return curve
}
