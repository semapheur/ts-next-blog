import { gamma } from "mathjs"

export function betaPDF(x: number, a: number, b: number): number {
  if (x < 0 || x > 1 || a <= 0 || b <= 0) {
    return 0
  }
  return Math.exp(lnBetaPDF(x, a, b))
}

export function _betaPDF(x: number, a: number, b: number): number {
  if (x < 0 || x > 1 || a <= 0 || b <= 0) {
    return 0
  }
  const numerator = x ** (a - 1) * (1 - x) ** (b - 1)
  const denominator = betaFunction(a, b)

  return numerator / denominator
}

function betaFunction(a: number, b: number): number {
  return (gamma(a) * gamma(b)) / gamma(a + b)
}

function lnBetaPDF(x: number, a: number, b: number): number {
  return (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lnBetaFunc(a, b)
}
function lnBetaFunc(a: number, b: number): number {
  let result = 0.0

  for (let i = 0; i < a - 2; i++) {
    result += Math.log(a - 1 - i)
  }
  for (let i = 0; i < b - 2; i++) {
    result += Math.log(b - 1 - i)
  }
  for (let i = 0; i < a + b - 2; i++) {
    result -= Math.log(a + b - 1 - i)
  }
  return result
}
