'use client'

import { useEffect, useRef } from 'react'
import { signal, effect } from '@preact/signals-react'
import useMousePosition from 'hooks/useMousePosition'
import {
  parse, 
  ConstantNode, 
  FunctionNode, 
  MathNode,
  OperatorNode,
  ParenthesisNode,
  SymbolNode,   
} from 'mathjs'

import useResizeObserver from 'hooks/useResizeObserver'

import ComplexInput from 'components/ComplexInput'

import { resizeCanvas } from 'utils/canvas'
import { requiredFunctions } from 'utils/complex'
import { makeProgram, makeShader, setRectangle } from 'utils/webgl'
import { Vec2 } from 'utils/types'
import Vector from 'utils/vector'

type ViewRange = {
  x: Vector
  y: Vector
}

const expression = signal<string>('')
const glSignal = signal<WebGL2RenderingContext|null>(null)
const viewRange = signal<ViewRange>({
  x: new Vector(-10, 10),
  y: new Vector(-10, 10)
})

effect(() => {
  const gl = glSignal.value

  if (expression.value && gl) {
    const translate = {
      x: -gl.canvas.width / 2,
      y: -gl.canvas.height / 2
    }
    const scale = {
      x: 0.01,
      y: 0.01
    }

    makeScene(gl, expression.value, scale, translate)
  }
})

export default function DomainColoring() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLCanvasElement>(null)
  const size = useResizeObserver(wrapRef)
  //const axisRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = plotRef.current
    const wrap = wrapRef.current

    if (!(canvas && wrap)) return

    viewRange.value = squareGrids(viewRange.value, wrap)

    const wrapRect = canvas.parentElement!.getBoundingClientRect()
    canvas.width = wrapRect.width
    canvas.height = wrapRect.height

    glSignal.value = canvas.getContext('webgl2')

    if (!glSignal.value) {
      console.error('Unable to initialize WebGL')
      return
    }
  }, [])

  return (
    <div ref={wrapRef} className='relative w-full h-full'>
      <ComplexInput expression={expression} className='absolute left-0 top-0'/>
      <canvas ref={plotRef}/>
      {/*<canvas ref={axisRef} className='absolute inset-0 w-full h-full'/>*/}
    </div>
  )
}

function makeScene(
  gl: WebGL2RenderingContext, 
  expression: string,
  scale: Vec2, translate: Vec2) 
{
  function render() {
    resizeCanvas(gl.canvas as HTMLCanvasElement)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniform2f(scaleLoc, scale.x, scale.y)
    gl.uniform2f(translateLoc, translate.x, translate.y)
    
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    //requestAnimationFrame(render)
  }

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
    console.log('AST could not be compiled:', expression)
    return
  }
  gl.useProgram(program)

  const scaleLoc = gl.getUniformLocation(program, 'u_scale')
  const translateLoc = gl.getUniformLocation(program, 'u_translate')

  const positionBuffer = gl.createBuffer()
  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const positionLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(positionLoc)
  setRectangle(gl, -1, -1, 2, 2)
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

  render()
}

function toGlsl(ast: MathNode): [string, Set<string>] {
  const vecOperators = new Set<string>(['+', '-'])
  const functions = new Set<string>()

  function callback(node: MathNode): MathNode {
    switch(node.type) {
      case 'SymbolNode': {
        if ((node as SymbolNode).name != 'i') return node
        
        return new FunctionNode('vec2', [new ConstantNode(0), new ConstantNode(1)])
      } 
      case 'ConstantNode': {
        const args = [new ConstantNode((node as ConstantNode).value), new ConstantNode(0)]
        return new FunctionNode('vec2', args)
      }
      case 'FunctionNode': {
        const fn = 'c' + (node as FunctionNode).fn.name
        functions.add(fn)

        const args = (node as FunctionNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }
        return new FunctionNode(fn, args) 
      }
      case 'OperatorNode': {
        const op = (node as OperatorNode).op
        const fn = 'c' + (node as OperatorNode).fn
        
        const args = (node as OperatorNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }

        if (vecOperators.has(op)) {
          return new OperatorNode(op, op, args)
        } else {
          functions.add(fn)
          return new FunctionNode(fn, args)
        } 
      }
      case 'ParenthesisNode': {
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

function makeFragmentCode(
  expression: string,
  //uniforms: string[]
): string
{

  //const uniformBuffers = uniforms.map((name) => {
  //  `uniform vec2 ${name}`
  //})

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

  const float PI = 3.14159265358979323846264;

  ${functionDeclarations.join('\n')}

  vec2 complex_function(vec2 z) {
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
    float modulus = length(z);
    return 0.5 + 0.5 * (modulus - floor(modulus));
  }

  float gridlines(vec2 z, float alpha) {
    return pow(abs(sin(z.x) * PI), alpha) * pow(abs(sin(z.y) * PI), alpha);
  }

  vec3 domain_color(vec2 z, float alpha) {
    float h = norm_phase(z);
    float s = magnitude_shading(z);
    float v = gridlines(z, alpha);

    return hsv2rgb(vec3(h,s,v));
  }

  void main() {
    vec2 coord = (gl_FragCoord.xy + u_translate) * u_scale;

    vec2 z = complex_function(coord);

    vec3 color = domain_color(z, 0.1);
    fragColor = vec4(color, 1.0);
  }`
}

function squareGrids(view: ViewRange, element: HTMLElement): ViewRange {
  const {width, height} = element.getBoundingClientRect()

  const viewLength = new Vector(
    view.x.diff() as number, 
    view.y.diff() as number
  )

  if (width < height) {
    const aspect = width / height
    const xLength = viewLength.y * aspect

    view.x = new Vector(
      view.x.mean - xLength/2,
      view.x.mean + xLength/2
    )
  } else if (width > height) {
    const aspect = height / width
    const yLength = viewLength.x * aspect

    view.y = new Vector(
      view.y.mean - yLength/2,
      view.y.mean + yLength/2
    )
  } else {
    const deltaLength = viewLength.diff() as number
    if (deltaLength < 0) {
      view.x = new Vector(
        view.x.mean - viewLength.y / 2,
        view.x.mean + viewLength.y / 2
      )
    } else if (deltaLength > 0) {
      view.y = new Vector(
        view.y.mean - viewLength.x / 2,
        view.y.mean + viewLength.x / 2
      )
    }
  }
  return view
}