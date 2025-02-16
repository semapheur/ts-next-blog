"use client"

import { useEffect, useRef } from "react"
import { effect, signal } from "@preact/signals-react"
import {
  parse,
  ConstantNode,
  FunctionNode,
  type MathNode,
  OperatorNode,
  type ParenthesisNode,
  type SymbolNode,
} from "mathjs"

import CanvasGrid from "lib/components/CanvasGrid"
import ComplexInput from "lib/components/ComplexInput"
import TransformDiv, { transform } from "lib/components/TransformDiv"

import { resizeCanvas } from "lib/utils/canvas"
import { requiredFunctions } from "lib/utils/complex"
import { gridUnit } from "lib/utils/num"
import type { ViewRange } from "lib/utils/types"
import Vector from "lib/utils/vector"
import { makeProgram, makeShader, setRectangle } from "lib/utils/webgl"

const viewRange = signal<ViewRange>({
  x: new Vector(-10, 10),
  y: new Vector(-10, 10),
})
const minGrid = 50
const expression = signal<string>("")
const gl = signal<WebGL2RenderingContext | null>(null)
const grid = signal<CanvasRenderingContext2D | null>(null)

effect(() => {
  if (!(expression.value && gl.value && grid.value && transform.value)) return
  makeScene(gl.value, grid.value, expression.value, transform.value)
})

export default function DomainColoring() {
  const plotCanvasRef = useRef<HTMLCanvasElement>(null)
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const plotCanvas = plotCanvasRef.current
    const gridCanvas = gridCanvasRef.current

    if (!(plotCanvas && gridCanvas)) return

    gl.value = plotCanvas.getContext("webgl2")
    grid.value = gridCanvas.getContext("2d")

    if (!gl.value) {
      console.error("Unable to initialize WebGL")
      return
    }
  }, [])

  return (
    <TransformDiv viewRange={viewRange} className="relative size-full">
      <canvas ref={plotCanvasRef} className="absolute inset-0 size-full" />
      <canvas ref={gridCanvasRef} className="absolute inset-0 size-full" />
      <ComplexInput expression={expression} className="absolute top-0 left-0" />
    </TransformDiv>
  )
}

function makeScene(
  gl: WebGL2RenderingContext,
  ctx: CanvasRenderingContext2D,
  expression: string,
  matrix: DOMMatrix,
) {
  function renderPlot() {
    resizeCanvas(gl.canvas as HTMLCanvasElement)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniform2f(scaleLoc, matrix.a, matrix.d)
    gl.uniform2f(translateLoc, matrix.e, gl.canvas.height - matrix.f)
    const unit = gridUnit(minGrid / matrix.a)
    gl.uniform1f(unitLoc, unit)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    requestAnimationFrame(renderPlot)
  }

  function renderGrid() {
    resizeCanvas(ctx.canvas as HTMLCanvasElement)

    grid.updateTransform(matrix)
    grid.draw()

    requestAnimationFrame(renderGrid)
  }

  const grid = new CanvasGrid(
    ctx.canvas,
    transform.value,
    undefined,
    false,
    true,
  )

  const vertexCode = `#version 300 es
    in vec2 a_position;

    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }
  `

  const vertexShader = makeShader(gl, gl.VERTEX_SHADER, vertexCode)

  const fragmentCode = makeFragmentCode(expression)
  const fragmentShader = makeShader(gl, gl.FRAGMENT_SHADER, fragmentCode)

  if (!(vertexShader && fragmentShader)) {
    console.log(fragmentCode)
    return
  }

  const program = makeProgram(gl, vertexShader, fragmentShader)
  if (program === undefined) {
    console.log("AST could not be compiled:", expression)
    return
  }
  gl.useProgram(program)

  const scaleLoc = gl.getUniformLocation(program, "u_scale")
  const translateLoc = gl.getUniformLocation(program, "u_translate")
  const unitLoc = gl.getUniformLocation(program, "u_unit")

  const positionBuffer = gl.createBuffer()
  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const positionLoc = gl.getAttribLocation(program, "a_position")
  gl.enableVertexAttribArray(positionLoc)
  setRectangle(gl, -1, -1, 2, 2)
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

  renderPlot()
  renderGrid()
}

function toGlsl(ast: MathNode): [string, Set<string>] {
  const vecOperators = new Set<string>(["+", "-"])
  const functions = new Set<string>()

  function callback(node: MathNode): MathNode {
    switch (node.type) {
      case "SymbolNode": {
        if ((node as SymbolNode).name !== "i") return node

        return new FunctionNode("vec2", [
          new ConstantNode(0),
          new ConstantNode(1),
        ])
      }
      case "ConstantNode": {
        const args = [
          new ConstantNode((node as ConstantNode).value),
          new ConstantNode(0),
        ]
        return new FunctionNode("vec2", args)
      }
      case "FunctionNode": {
        const fn = `c_${(node as FunctionNode).fn.name}`
        functions.add(fn)

        const args = (node as FunctionNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }
        return new FunctionNode(fn, args)
      }
      case "OperatorNode": {
        const op = (node as OperatorNode).op
        const fn = `c_${(node as OperatorNode).fn}`

        const args = (node as OperatorNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }
        if (vecOperators.has(op)) {
          return new OperatorNode(op, op, args)
        }
        functions.add(fn)
        return new FunctionNode(fn, args)
      }
      case "ParenthesisNode": {
        return callback((node as ParenthesisNode).content)
      }
      default: {
        return node
      }
    }
  }

  const glsl = ast.transform(callback)
  return [glsl.toString(), functions]
}

function makeFragmentCode(expression: string): string {
  const [fn, required] = toGlsl(parse(expression))
  const functionDeclarations = requiredFunctions(required)

  return `#version 300 es
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  out vec4 fragColor;

  uniform vec2 u_scale;
  uniform vec2 u_translate;
  uniform float u_unit;

  const float PI = 3.14159265358979323846264;
                         
  ${functionDeclarations.join("\n")}

  vec2 pixel_to_draw(vec2 xy) {
    return (xy - u_translate) / u_scale;
  }

  vec2 complex_function(vec2 xy) {
    vec2 z = pixel_to_draw(xy);
    return ${fn};
  }

  vec3 hsv2rgb(vec3 hsv) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
    return hsv.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), hsv.y);
  }

  float norm_phase(vec2 z) {
    return atan(z.y, z.x) / (2.0 * PI);
  }

  float magnitude_shading(vec2 z) {
    float log_modulus = log2(length(z));
    return 0.5 + 0.5 * (log_modulus - floor(log_modulus));
  }

  float gridlines(vec2 z, float alpha) {
    float GRID = PI / u_unit;
    return pow(abs(sin(GRID * z.x)), alpha) * pow(abs(sin(GRID * z.y)), alpha);
  }

  vec3 domain_color(vec2 z, float alpha) {
    float h = norm_phase(z);
    float s = magnitude_shading(z);
    float v = gridlines(z, alpha);

    return hsv2rgb(vec3(h,s,v));
  }

  void main() {
    // 4-Rook supersampling
    const vec2 A = vec2(0.125, 0.375);
    const vec2 B = vec2(0.375, -0.125);

    vec2 xy = gl_FragCoord.xy;

    vec2 z1 = complex_function(xy + A);
    vec2 z2 = complex_function(xy - A);
    vec2 z3 = complex_function(xy + B);
    vec2 z4 = complex_function(xy - B);

    vec3 color1 = domain_color(z1, 0.1);
    vec3 color2 = domain_color(z2, 0.1);
    vec3 color3 = domain_color(z3, 0.1);
    vec3 color4 = domain_color(z4, 0.1);

    vec3 color = 0.25 * (color1 + color2 + color3 + color4);
    fragColor = vec4(color, 1.0);
  }`
}
