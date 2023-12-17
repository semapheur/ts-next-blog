export default class Vector extends Array<number> {

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
  
  get norm(): number {
    return Math.sqrt(this.dot(this)!)
  }

  get sum(): number {
    let sum = 0
    for (let i = 0; i < this.length; i++) {
      sum += this[i]
    }
    return sum 
  }

  get mean(): number {
    return this.sum / this.length 
  }

  public coord(i: number): number|undefined {
    if (i > this.length) {
      throw new Error(`Index ${i} is out of bounds on [0, ${this.length-1}]`)
    }
    return this[i]
  }

  public equal(...vectors: Vector[]): boolean {
    for (const v of vectors) {
      if (this.length !== v.length) return false
      for (const i in this) {
        if (this[i] !== v[i]) return false
      }
    }
    return true
  }

  public add(...vectors: Vector[]): Vector {
    const components = [...this]
    for (const v of vectors) {
      if (this.length !== v.length) {
        throw new Error('Addition of vectors with different dimensions is not defined')
      }
      for (const i in components) {
        components[i] += v[i]
      }
    }
    return new Vector(...components)
  }

  public addScalar(scalar: number): Vector {
    const components = [...this]

    for (const i in components) {
      components[i] += scalar
    }
    return new Vector(...components)
  }

  public addScalarInplace(scalar: number) {
    for (const i in this) {
      this[i] += scalar
    }
  }

  public subtract(...vectors: Vector[]): Vector {
    const components = [...this]

    for (const v of vectors) {
      if (this.length !== v.length) {
        throw new Error('Substraction of vectors with different dimensions is not defined')
      }
      for (const i in components) {
        components[i] -= v[i]
      }
    }
    return new Vector(...components)
  }

  public scale(...scalars: number[]): Vector {
    const components = [...this]

    for (const s of scalars) {
      for (const i in components) {
        components[i] *= s
      }
    }
    return new Vector(...components)
  }

  public negate(): Vector {
    return this.scale(-1)
  }

  public normalize(): Vector {
    return this.scale(1 / this.norm)
  }

  public diff(): number | Vector {
    if (this.length === 2) {
      return this[1] - this[0]
    }

    const result = Array<number>(this.length - 1)
    for (let i = 0; i < this.length - 1; i++) {
      result[i] = this[i + 1] - this[i] 
    }
    return new Vector(...result)
  }

  public dot(vector: Vector): number {
    if (this.length !== vector.length) {
      throw new Error('Dot product of vectors with different dimensions is not defined')
    }

    let dot = 0
    for (const i in this) {
      dot += this[i] * vector[i]
    }
    return dot
  }

  public cross(vector: Vector): Vector {
    if (this.length !== 3 || vector.length !== 3) {
      throw new Error('Cross product is only defined for 3-dimensional vectors')
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

  public multiply(...vectors: Vector[]): Vector[] {
    if (this.length !== vectors.length) {
      throw new Error('Elementwise multiplication of vectors with different dimensions is not definedd')
    }
    
    return [...vectors].map((v, i) => {
      return v.scale(this[i])
    })
  }

  public print(delimiter = ','): string {
    return this.join(delimiter)
  }

  public toArray(): number[] {
    return [...this]
  }

  public static distance(a: Vector, b: Vector): number {
    if (a.length !== b.length) {
      throw new Error('Distance of vectors with different dimensions is not defined')
    }

    return a.subtract(b).norm
  }

  public static add(a: Vector[], b: Vector[]): Vector[] {
    if (a.length !== b.length) {
      throw new Error('Elementwise addition of vectors is not defined')
    }

    const result = Array.from(a)
    for (let i=0; i < result.length; i++) {
      result[i] = result[i].add(b[i])
    }
    return result
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
    if (a.length !== b.length) {
      throw new Error('Endpoints of a line must have same dimension')
    }

    const line = Array<Vector>(numPoints)
    line[0] = a;
    line[line.length - 1] = b

    const step = 1/numPoints
    for (let t = 1; t < line.length - 1; t++) {
      line[t] = a.scale(1 - t * step).add(b.scale(t * step))!
    }
    return line
}
}

export class Curve extends Array<Vector> {

  constructor(...vectors: Vector[]) {
    for (let i=0; i < vectors.length-1; i++) {
      if (vectors[i].length !== vectors[i+1].length) {
        throw new Error('Points in a curve must have common dimension')
      }
    }
    super(...vectors)
  }

  public add(points: Curve): this|null {
    if (this.length !== points.length) return null
    for (const p in this) {
      this[p].add(points[p])
    }
    return this
  }
}