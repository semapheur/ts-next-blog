export default class BinomialOpinion {
  private Opinion = {
    b: 1 / 3,
    d: 1 / 3,
    u: 1 / 3,
    a: 0.5,
  }

  constructor(
    belief: number,
    disbelief: number,
    uncertainty: number,
    baseRate: number,
  ) {
    if (!this.checkOpinion(belief, disbelief, uncertainty, baseRate)) {
      throw new Error("Invalid parameters")
    }
  }

  private checkOpinion(b: number, d: number, u: number, a: number) {
    if (b < 0 || b > 1 || d < 0 || d > 1 || u < 0 || u > 1 || a < 0 || a > 1)
      return false

    if (b + d + u !== 1) return false

    return true
  }
}
