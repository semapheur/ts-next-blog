export function sum(arr: number[], start?: number, stop?: number): number {

  if (!start) start = 0

  if (typeof stop === undefined || stop >= arr.length) {
    console.log(stop)
    stop = arr.length - 1
  }
  let sum = 0
  for (let i = start; i <= stop; i++) {
    sum += arr[i]
  }
  return sum
}

export function findAllIndices<T>(arr: Array<T>, value: T): number[] {
  let indices: number[] = []

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) indices.push(i)
  }
  return indices;
}

export function compareArrays<T>(a: Array<T>, b: Array<T>): boolean {
  return a.length === b.length && a.every((element, index) => element === b[index])
}

export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set<T>()

  for (const el of setA) {
    if (setB.has(el)) {
      result.add(el)
    }
  }
  return result
}

export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set(setA)
  
  for (const el of setB) {
    result.delete(el)
  }
  return result
}