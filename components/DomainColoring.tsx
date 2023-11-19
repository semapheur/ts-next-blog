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

import ComplexInput from 'components/ComplexInput'
import { requiredFunctions } from 'utils/complex'
import { VERTEX_SHADER_2D, makeProgram, init2dBuffers, makeShader } from 'utils/webgl'
import useResizeObserver from 'hooks/useResizeObserver'

const expression = signal<string>('')
const gl = signal<WebGL2RenderingContext|null>(null)

effect(() => {
  if (expression.value && gl.value) {
    makeScene(gl.value, expression.value)
    render(gl.value)
  }
})

export default function DomainColoring() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLCanvasElement>(null)
  const size = useResizeObserver(wrapRef)
  //const axisRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = plotRef.current

    if (!canvas) return

    const wrapRect = canvas.parentElement!.getBoundingClientRect()
    canvas.width = wrapRect.width
    canvas.height = wrapRect.height

    gl.value = canvas.getContext('webgl2')

    if (!gl.value) {
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

function render(gl: WebGL2RenderingContext) {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function makeScene(gl: WebGL2RenderingContext, expression: string) {
  const vertexShader = makeShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_2D)

  const fragmentShaderSource = makeFragmentShaderSource(expression)
  const fragmentShader = makeShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  if (!(vertexShader && fragmentShader)) {
    console.log(fragmentShaderSource)
    return
  }

  const program = makeProgram(gl, vertexShader, fragmentShader)
  if (program === undefined) {
    console.log('AST could not be compiled:', expression)
    return
  }
  init2dBuffers(gl)
  gl.useProgram(program)

  const positionLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(positionLoc)
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
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

function makeFragmentShaderSource(
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

  out vec4 FragColor;

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

  float phase(vec2 z) {
    return atan(z.y, z.x) + 2.0 * PI / 3.0;
  }

  float magnitude_shading(vec2 z) {
    float modulus = length(z);
    return 0.5 + 0.5 * (modulus - floor(modulus));
  }

  float gridlines(vec2 z, float alpha) {
    return pow(abs(sin(z.x) * PI), alpha) * pow(abs(sin(z.y) * PI), alpha);
  }

  vec3 domain_color(vec2 z, float alpha) {
    float h = phase(z);
    float s = magnitude_shading(z);
    float v = gridlines(z, alpha);

    return hsv2rgb(vec3(h,s,v));
  }

  void main() {
    vec2 z = complex_function(gl_FragCoord.xy);

    vec3 color = domain_color(z, 0.1);
    FragColor = vec4(color, 1.0);
  }`
}