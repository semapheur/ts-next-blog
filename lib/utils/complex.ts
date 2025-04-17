import { parse, type FunctionNode, type SymbolNode } from "mathjs"

import { union, reorderSet } from "lib/utils/num"

function functionDependencies(glslExpression: string) {
  const dependencies = new Set<string>()

  const ast = parse(glslExpression)

  ast.traverse((node, _path, _parent) => {
    if (
      node.type === "FunctionNode" &&
      (node as FunctionNode).fn.name.startsWith("c_")
    ) {
      const fn = (node as FunctionNode).fn.name
      if (fn.startsWith("c_")) dependencies.add(fn)
    }
  })

  return dependencies
}

function functionVariables(glslExpression: string) {
  const variables = new Set<string>()

  const ast = parse(glslExpression)

  ast.traverse((node, _path, _parent) => {
    if (node.type === "SymbolNode") {
      const variable = (node as SymbolNode).name

      if (variable[0] === "z") variables.add(variable)
    }
  })

  return variables
}

function resolveDependencies(required: Set<string>, cfn: ComplexFunction) {
  for (const fn of cfn.dependencies) {
    const cfn = new ComplexFunction(fn, FUNCTIONS[fn])
    required = resolveDependencies(required, cfn)
    required = reorderSet(required, fn)
  }
  return required
}

export function requiredFunctions(required: Set<string>): string[] {
  for (const fn of required) {
    const cfn = new ComplexFunction(fn, FUNCTIONS[fn])
    required = resolveDependencies(required, cfn)
  }
  return Array.from(required)
    .reverse()
    .map((fn) => new ComplexFunction(fn, FUNCTIONS[fn]).code)
}

class ComplexFunction {
  private name: string
  private body: string | string[]
  private variables: Set<string>

  constructor(name: string, body: string | string[]) {
    this.name = name
    this.body = body

    if (Array.isArray(body)) {
      for (const b of body) {
        const expression = b.split("=").splice(-1)[0]
        this.variables = union(this.variables, functionVariables(expression))
      }
    } else {
      this.variables = functionVariables(body)
    }
  }

  get dependencies() {
    if (typeof this.body === "string") {
      return functionDependencies(this.body)
    }

    let result = new Set<string>()
    for (const b of this.body) {
      const expression = b.split("=").splice(-1)[0]
      result = union(result, functionDependencies(expression))
    }
    return result
  }

  get arguments() {
    return Array.from(this.variables)
      .map((v) => `vec2 ${v}`)
      .join(",")
  }

  get code() {
    const declaration = `vec2 ${this.name}(${this.arguments})`
    if (typeof this.body === "string") {
      return `${declaration} {return ${this.body};}`
    }
    const body_ = [...this.body]
    const body = `${body_.splice(0, body_.length - 1).join(";")};return ${body_.splice(-1)};`

    return `${declaration} {${body}}`
  }
}

const FUNCTIONS = {
  c_conj: "vec2(z.x, -z.y)",
  c_abs: "vec2(length(z), 0.0)",
  c_arg: "vec2(atan(z.y, z.x), 0.0)",
  c_reciprocal: "c_conj(z) / dot(z, z)",
  c_multiply: "mat2(z1, -z1.y, z1.x) * z2",
  c_divide: "c_multiply(z1, c_reciprocal(z2))",
  c_exp: "exp(z.x) * vec2(cos(z.y), sin(z.y))",
  c_log: "vec2(log(length(z)), atan(z.y, z.x))",
  c_square: "vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y)",
  c_pow: "c_exp(c_multiply(c_log(z1), z2))",
  c_sqrt: `
    float phase = 0.5 * atan(z.y, z.x);
    return sqrt(length(z)) * vec2(cos(phase), sin(phase))
  `,
  c_nthRoot: `
    float phase = atan(z1.y, z1.x) / int(z2.x);
    pow(length(z1), 1.0 / z2) * vec2(cos(phase), sin(phase))
  `,
  c_sin: "vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y))",
  c_cos: "vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y))",
  c_tan: [
    "float tan_x = tan(z.x)",
    "float tanh_y = tanh(z.y)",
    "c_divide(vec2(tan_x, tanh_y), vec2(1, -tan_x * tanh_y))",
  ],
  c_sec: "c_reciprocal(c_cos(z))",
  c_csc: "c_reciprocal(c_sin(z))",
  c_cot: "c_reciprocal(c_tan(z))",
  c_sinh: "vec2(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y))",
  c_cosh: "vec2(cosh(z.x) * cos(z.y), sinh(z.x) * sin(z.y))",
  c_tanh: [
    "float tanh_x = tanh(z.x)",
    "float tan_y = tan(z.y)",
    "c_divide(vec2(tanh_x, tan_y), vec2(1, tanh_x * tan_y))",
  ],
}
