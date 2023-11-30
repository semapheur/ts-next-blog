import {
  parse, 
  FunctionNode,
  SymbolNode
} from 'mathjs'

function functionDependencies(glslExpression: string) {
  const dependencies = new Set<string>()

  const ast = parse(glslExpression)

  ast.traverse(function(node, path, parent) {
    if (node.type === 'FunctionNode' && (node as FunctionNode).fn.name.startsWith('c_')) {
      const fn = (node as FunctionNode).fn.name
      if (fn.startsWith('c_')) dependencies.add(fn)
    }
  })

  return dependencies
}

function functionVariables(glslExpression: string) {
  const variables = new Set<string>()

  const ast = parse(glslExpression)
  
  ast.traverse(function(node, path, parent) {
    if (node.type === 'SymbolNode') {
      const variable = (node as SymbolNode).name

      if (variable[0] === 'z') variables.add(variable)
    }
  })

  return variables
}

export function requiredFunctions(required: Set<string>): string[] {
  const stack = Array.from(required)
  const declarations: string[] = []

  while (stack.length > 0) {
    const fn = stack.pop()!
    const cfn = new ComplexFunction(fn, FUNCTIONS[fn])

    declarations.unshift(cfn.code) 
    for (let d of cfn.dependencies) {
      if (required.has(d)) continue

      required.add(d)
      stack.push(d)
    }
  }
 
  return declarations
}

class ComplexFunction{
  private name: string
  private body: string
  private variables: Set<string>

  constructor(name: string, body: string) {
    this.name = name
    this.body = body
    this.variables = functionVariables(body)
  }

  get dependencies() {
    return functionDependencies(this.body)
  }

  get arguments() {
    let declarations = ''
    for (const v of this.variables) {
      declarations += `vec2 ${v},`
    }

    return declarations.slice(0, -1)
  }

  get code() {
    return `vec2 ${this.name}(${this.arguments}) { return ${this.body};}`
  }
}

const FUNCTIONS = {
  c_conj: 'vec2(z.x, -z.y)',
  c_abs: 'vec2(length(z), 0)',
  c_arg: 'vec2(atan(z.y, z.x), 0)',
  c_reciprocal: 'c_conj(z) / dot(z, z)',
  c_multiply: 'mat2(z1, -z1.y, z1.x) * z2',
  c_divide: 'c_multiply(z1, c_reciprocal(w))',
  c_exp: 'exp(z.x) * vec2(cos(z.y), sin(z.y))',
  c_log: 'vec2(log(length(z)), atan(z.y, z.x))',
  c_pow: 'c_exp(c_multiply(c_log(z1), z2))',
  c_sin: 'vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y))',
  c_cos: 'vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y))',
}