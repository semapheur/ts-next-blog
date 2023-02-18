export default class Vector extends Array<number> {
  //public components: number[]
  //public readonly dimension: number

  constructor(...components: number[]) {
    super(...components)
    //this.components = components
    //this.dimension = components.length

    const test = this[1]
  }

  get x(): number {
    return this[0]
  }
  set x(newX: number) {
    this[0] = newX
  }

  get y(): number {
    return this[1]
  }
  set y(newY: number) {
    this[1] = newY
  }

  get z(): number {
    return this[2]
  }
  set z(newZ: number) {
    this[2] = newZ
  }

  get norm() : number {
    return Math.sqrt(this.dot(this))
  }

  public coord(i: number): number {
    return this[i]
  }

  public equal(...vectors: Vector[]): boolean {
    for (const v of vectors) {
      if (this.length !== v.length) return false
      for (let i in this) {
        if (this[i] !== v[i]) return false
      }
    }
    return true
  }

  public add(...vectors: Vector[]): Vector|null {
    const components = [...this]

    for (const v of vectors) {
      if (this.length !== v.length) return null
      for (let i in components) {
        components[i] += v[i]
      }
    }
    return new Vector(...components)
  }

  public addScalar(scalar: number): Vector {
    const components = [...this]

    for (let i in components) {
      components[i] += scalar
    }
    return new Vector(...components)
  }

  public subtract(...vectors: Vector[]): Vector|null {
    const components = [...this]

    for (const v of vectors) {
      if (this.length !== v.length) return null
      for (let i in components) {
        components[i] -= v[i]
      }
    }
    return new Vector(...components)
  }

  public scale(...scalars: number[]): Vector {
    const components = [...this]

    for (let s of scalars) {
      for (let i in components) {
        components[i] *= s
      }
    }
    return new Vector(...components)
  }

  public negate(): Vector {
    return this.scale(-1)
  }

  public normalize(): Vector {
    return this.scale(1/this.norm)
  }

  public dot(vector: Vector): number|null {
    if (this.length !== vector.length) return null

    let dot = 0
    for (let i in this) {
      dot += this[i] * vector[i]
    }
    return dot
  }

  public cross(vector: Vector): Vector|null {
    if (this.length !== 3 || vector.length !== 3) {
      return null
    }
    const [x1, y1, z1] = [...this]
    const [x2, y2, z2] = [...this]
    
    return new Vector(
      y1 * z2 - z1 * y2,
      z1 * x2 - z1 * z2,
      x1 * y2 - y1 * x2
    )
  }

  public outer(vector: Vector): Vector[] {
    const result = Array<Vector>(this.length).fill(
      new Vector(...vector)
    ).map((v, i) => {
      return v.scale(this[i])
    })
    return result;
  }

  public multiply(...vectors: Vector[]): Vector[]|null {
    if (this.length !== vectors.length) return null;
    
    return [...vectors].map((v, i) => {
      return v.scale(this[i])
    })
  }

  public print(delimiter?: string): string {
    if (!delimiter) {
      delimiter = ','
    }

    return this.join(delimiter)
  }

  public toArray(): number[] {
    return [...this]
  }

  public static distance(a: Vector, b: Vector): number {
    return a.subtract(b).norm
  }

  public static add(a: Vector[], b: Vector[]): Vector[]|null {
    if (a.length !== b.length) return null;

    return [...a].map((v, i) => { return v.add(b[i]) })
  }

  public static linspace(start: number, stop: number, steps: number): Vector {
    const step = (stop - start) / (steps - 1)
    const arr: number[] = Array(steps).fill(0.0)

    for (let i = 0; i < arr.length; i++) {
        arr[i] = start + (i * step)
    }
    return new Vector(...arr)
  }

  public static line(a: Vector, b: Vector, numPoints: number): Vector[] {
  const line = Array<Vector>(numPoints)
  line[0] = a;
  line[line.length - 1] = b

  const step = 1/numPoints
  for (let t = 1; t < line.length - 1; t++) {
    line[t] = a.scale(1 - t * step).add(b.scale(t * step))
  }
  return line
}
}

export class Vectors {
  public components: Vector[]
  public readonly length: number

  constructor(...vectors: Vector[]) {
    this.components = vectors
    this.length = vectors.length
  }

  public add(points: Vectors): this {
    if (this.length !== points.length) return null
    for (let p in this.components) {
      this.components[p].add(points.components[p])
    }
    return this
  }
}