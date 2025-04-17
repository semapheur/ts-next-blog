import { LinearCongruent } from "./random"
import Vector, { Curve } from "./vector"

const defaultAmplitude = 1
const defaultFrequency = 1
const defaultOctaves = 1
const defaultOffset = 0
const defaultPersistence = 0.5

type Options = {
  amplitude: number
  frequency: number
  octaves: number
  offset: number
  persistence: number
}

type NoiseFn = (v: Vector | number) => number

function permutationTable(): Uint8Array {
  const p = new Uint8Array(256)

  for (let i = 0; i < p.length; i++) {
    p[i] = i
  }
  p.sort(() => Math.random() - 0.5)

  return new Uint8Array([...p, ...p])
}

export function fractalNoise(
  v: Vector | number,
  noiseFn: NoiseFn,
  {
    amplitude = defaultAmplitude,
    frequency = defaultFrequency,
    octaves = defaultOctaves,
    persistence = defaultPersistence,
  }: Partial<Options>,
): number {
  let value = 0

  for (let o = 0; o < octaves; o++) {
    const f = frequency * 2 ** octaves
    value += noiseFn(v) * (amplitude * persistence ** o)
  }

  return value / (2 - 1 / 2 ** (octaves - 1))
}

export class ValueNoise {
  private size = 256
  private r = Array<number>(this.size)

  constructor(seed: number, size?: number) {
    if (size) this.size = size

    const lcg = new LinearCongruent(seed)
    for (let i = 0; i < this.size; i++) {
      this.r[i] = lcg.rand()
    }
  }

  get rnd(): Array<number> {
    return this.r
  }

  public noise(x: number) {
    const xi = Math.floor(x)
    const d = x - xi

    const xMin = xi % this.size
    const xMax = (xMin + 1) % this.size

    return this.interpolate(d, this.r[xMin], this.r[xMax])
  }

  public fractalNoise(
    x: number,
    {
      amplitude = defaultAmplitude,
      frequency = defaultFrequency,
      octaves = defaultOctaves,
      offset = defaultOffset,
      persistence = defaultPersistence,
    }: Partial<Options>,
  ): number {
    let value = 0

    for (let o = 0; o < octaves; o++) {
      const f = frequency * 2 ** o
      const a = amplitude * persistence ** o
      value += this.noise(offset + x * f) * a
    }
    return value / (2 - 1 / 2 ** (octaves - 1))
  }

  //cosine interpolation
  private interpolate(x: number, a: number, b: number): number {
    const s = (1 - Math.cos(x * Math.PI)) * 0.5
    //const s = 6*x**5 - 15*x**4 + 10*x**3
    return (1 - s) * a + s * b
  }
}

export function drawHill(
  waypoints: Curve,
  Noise: ValueNoise,
  numPoints: number[],
  amplitude: number[],
  freq: number[],
  offset: number[],
  octaves: number[],
): Curve {
  const result: Vector[] = []

  for (let i = 0; i < waypoints.length - 1; i++) {
    const segment = drawCurve(
      waypoints[i],
      waypoints[i + 1],
      Noise,
      numPoints[i],
      amplitude[i],
      freq[i],
      offset[i],
      octaves[i],
    )

    if (i < waypoints.length - 2) {
      segment.pop()
    }
    result.push(...segment)
  }
  return new Curve(...result)
}

export function drawCurve(
  a: Vector,
  b: Vector,
  Noise: ValueNoise,
  numPoints: number,
  amplitude: number,
  freq: number,
  offset = 0,
  octaves = 1,
): Vector[] {
  const vecLine = b.subtract(a)
  const normal = new Vector(-vecLine.y, vecLine.x).normalize()

  const curve = Vector.line(a, b, numPoints)
  for (let i = 1; i < curve.length - 1; i++) {
    const noise = Noise.fractalNoise(curve[i].x, {
      frequency: freq,
      offset: offset,
      octaves: octaves,
    })
    curve[i] = curve[i].add(normal.scale(amplitude * (2 * noise - 1)))
  }
  return curve
}
