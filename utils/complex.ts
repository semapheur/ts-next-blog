import {
  parse, 
  FunctionNode,
  SymbolNode
} from 'mathjs'

function functionDependencies(glslExpression: string) {
  const dependencies = new Set<string>()

  const ast = parse(glslExpression)

  ast.traverse(function(node, path, parent) {
    if (node.type === 'FunctionNode' && (node as FunctionNode).fn.name.startsWith('c')) {
      const fn = (node as FunctionNode).fn.name
      dependencies.add(fn)
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
      variables.add(variable)
    }
  })

  return variables
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
  cconj: 'vec2(z.x, -z.y)',
  cabs: 'vec2(length(z), 0)',
  carg: 'vec2(atan(z.y, z.x), 0)',
  creciprocal: 'cconj(z) / dot(z, z)',
  cmultiply: 'mat2(z1, -z1.y, z1.x) * z2',
  cdivide: 'cmul(z1, creciprocal(w))'
}