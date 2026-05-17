import {
  parse,
  type FunctionNode,
  type OperatorNode,
  type SymbolNode,
} from "mathjs";

import { union, reorderSet } from "lib/utils/num";

function functionDependencies(
  glslExpression: string,
  isInternalLibrary: boolean,
) {
  const dependencies = new Set<string>();

  const matches = glslExpression.matchAll(/\bc_[a-zA-Z0-9_]+\b/g);
  for (const match of matches) {
    dependencies.add(match[0]);
  }

  if (!isInternalLibrary) {
    if (/[^\beE]\+/.test(glslExpression)) {
      dependencies.add("c_add");
    }
    if (/[^\beE]-/.test(glslExpression)) {
      dependencies.add("c_subtract");
    }
  }

  return dependencies;
  /*
  const ast = parse(glslExpression);
  ast.traverse((node, _path, _parent) => {
    if (node.type === "OperatorNode") {
      if ((node as OperatorNode).op === "+") dependencies.add("c_add");
      if ((node as OperatorNode).op === "-") dependencies.add("c_subtract");
    }
    if (
      node.type === "FunctionNode" &&
      (node as FunctionNode).fn.name.startsWith("c_")
    ) {
      const fn = (node as FunctionNode).fn.name;
      if (fn.startsWith("c_")) dependencies.add(fn);
    }
  });
  */
}

function functionVariables(glslExpression: string) {
  const variables = new Set<string>();

  const matches = glslExpression.matchAll(/\b(z\w*)\b/g);

  for (const [, variable] of matches) {
    if (/^z\d*$/.test(variable)) {
      variables.add(variable);
    }
  }

  return variables;
  /*
  const ast = parse(glslExpression);
  ast.traverse((node, _path, _parent) => {
    if (node.type === "SymbolNode") {
      const variable = (node as SymbolNode).name;

      if (variable[0] === "z") variables.add(variable);
    }
  });
  */
}

function resolveDependencies(required: Set<string>, cfn: ComplexFunction) {
  for (const fn of cfn.dependencies) {
    const cfn = new ComplexFunction(fn, LOG_FUNCTIONS[fn]);
    required = resolveDependencies(required, cfn);
    required = reorderSet(required, fn);
  }
  return required;
}

export function requiredFunctions(required: Set<string>): string[] {
  for (const fn of required) {
    const cfn = new ComplexFunction(fn, LOG_FUNCTIONS[fn]);
    required = resolveDependencies(required, cfn);
  }
  return Array.from(required)
    .reverse()
    .map((fn) => new ComplexFunction(fn, LOG_FUNCTIONS[fn]).code);
}

class ComplexFunction {
  private name: string;
  private body: string | string[];
  private variables: Set<string>;

  constructor(name: string, body: string | string[]) {
    this.name = name;
    this.body = body;

    if (Array.isArray(body)) {
      for (const b of body) {
        const expression = b.split("=").splice(-1)[0];
        this.variables = union(this.variables, functionVariables(expression));
      }
    } else {
      this.variables = functionVariables(body);
    }
  }

  get dependencies() {
    if (typeof this.body === "string") {
      return functionDependencies(this.body, true);
    }

    let result = new Set<string>();
    for (const b of this.body) {
      const expression = b.split("=").splice(-1)[0];
      result = union(result, functionDependencies(expression, true));
    }
    return result;
  }

  get arguments() {
    return Array.from(this.variables)
      .map((v) => `vec2 ${v}`)
      .join(",");
  }

  get code() {
    const declaration = `vec2 ${this.name}(${this.arguments})`;
    if (typeof this.body === "string") {
      if (this.body.includes("return")) {
        return `${declaration} {${this.body.trim()}}`;
      }

      return `${declaration} {return ${this.body};}`;
    }
    const body_ = [...this.body];
    const body = `${body_.splice(0, body_.length - 1).join(";")};return ${body_.splice(-1)};`;

    return `${declaration} {${body}}`;
  }
}

const LOG_FUNCTIONS = {
  c_add: `
    float m = max(z1.x, z2.x);
    if (m < -1e20) return vec2(-1e37, 0.0);
    vec2 c1 = vec2(exp(z1.x - m) * cos(z1.y), exp(z1.x - m) * sin(z1.y));
    vec2 c2 = vec2(exp(z2.x - m) * cos(z2.y), exp(z2.x - m) * sin(z2.y));
    vec2 sum = c1 + c2;
    float r = length(sum);
    if (r == 0.0) return vec2(-1e37, 0.0);
    return vec2(m + log(r), atan(sum.y, sum.x));`,
  c_subtract: `
    float m = max(z1.x, z2.x);
    if (m < -1e20) return vec2(-1e37, 0.0);
    vec2 c1 = vec2(exp(z1.x - m) * cos(z1.y), exp(z1.x - m) * sin(z1.y));
    vec2 c2 = vec2(exp(z2.x - m) * cos(z2.y), exp(z2.x - m) * sin(z2.y));
    vec2 diff = c1 - c2;
    float r = length(diff);
    if (r == 0.0) return vec2(-1e37, 0.0);
    return vec2(m + log(r), atan(diff.y, diff.x));`,
  c_conj: "vec2(z.x, -z.y)",
  c_abs: "vec2(z.x, 0.0)",
  c_arg:
    "vec2(log(max(abs(z.y), 1e-37)), z.y >= 0.0 ? 0.0 : 3.141592653589793)",
  c_reciprocal: "vec2(-z.x, -z.y)",
  c_multiply: "vec2(z1.x + z2.x, z1.y + z2.y)",
  c_divide: "vec2(z1.x - z2.x, z1.y - z2.y)",
  c_exp: "exp(z.x) * vec2(cos(z.y), sin(z.y))",
  c_log: "vec2(log(length(z)), atan(z.y, z.x))",
  c_square: "vec2(2.0 * z.x, 2.0 * z.y)",
  c_pow: "c_exp(c_multiply(c_log(z1), z2))",
  c_sqrt: "vec2(0.5 * z.x, 0.5 * z.y)",
  c_nthRoot: "vec2(z1.x / z2.x, z1.y / z2.x)",
  c_sin: `
    float u = exp(z.x) * cos(z.y);
    float v = exp(z.x) * sin(z.y);
    vec2 e_iz = vec2(-v, u);
    vec2 e_miz = vec2(v, -u);
    vec2 diff = c_subtract(e_iz, e_miz);
    return vec2(diff.x - log(2.0), diff.y - 1.5707963267948966);`,
  c_cos: `
    float u = exp(z.x) * cos(z.y);
    float v = exp(z.x) * sin(z.y);
    vec2 e_iz = vec2(-v, u);
    vec2 e_miz = vec2(v, -u);
    vec2 sum = c_add(e_iz, e_miz);
    return vec2(sum.x - log(2.0), sum.y);`,
  c_tan: "c_divide(c_sin(z), c_cos(z))",
  c_sec: "c_reciprocal(c_cos(z))",
  c_csc: "c_reciprocal(c_sin(z))",
  c_cot: "c_reciprocal(c_tan(z))",
  c_sinh: `
    vec2 e_z = vec2(exp(z.x) * cos(z.y), exp(z.x) * sin(z.y));
    vec2 e_mz = vec2(exp(-z.x) * cos(-z.y), exp(-z.x) * sin(-z.y));
    vec2 diff = c_subtract(e_z, e_mz);
    return vec2(diff.x - log(2.0), diff.y);`,
  c_cosh: `
    vec2 e_z = vec2(exp(z.x) * cos(z.y), exp(z.x) * sin(z.y));
    vec2 e_mz = vec2(exp(-z.x) * cos(-z.y), exp(-z.x) * sin(-z.y));
    vec2 sum = c_add(e_z, e_mz);
    return vec2(sum.x - log(2.0), sum.y);`,
  c_tanh: "c_divide(c_sinh(z), c_cosh(z))",
};

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
};
