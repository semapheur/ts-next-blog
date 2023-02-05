import Vector from './vector'

// linear congruent generator
export class LinearCongruent {
  private modulus = 4294967296
  private a = 1664525
  private c = 1

  private seed: number
  private z: number
  
  constructor(seed?: number) {
    this.seed = this.z = seed ?? Date.now() % this.modulus
  }

  public rand() {
      this.z = (this.a * this.z + this.c) % this.modulus
      return this.z / this.modulus
  }
}

function boxMullerTransform() {
  const u1 = Math.random()
  const u2 = Math.random()

  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

  return {z0, z1}
}

function normal(mean: number, stddev: number): number {
  const {z0} = boxMullerTransform()
  return z0 * stddev + mean
}


export function brownianBridge(a: Vector, b: Vector, numPoints: number, amplitude: number): Vector[] {
  const result = Array<Vector>(numPoints)
  result[0] = a
  result[result.length - 1] = b

  const step = (b.x - a.x) / numPoints
  for (let i = 1; i < numPoints - 1; i++) {
    let t = a.x + i*step
    let w = normal(0, amplitude)
    let y = result[i-1].y + (b.y - result[i-1].y) * (step/(b.x - t)) + Math.sqrt(
      step*(b.x - t - step)/(b.x - t)) * w

    result[i] = new Vector(t, y)
  }

  return result
}


