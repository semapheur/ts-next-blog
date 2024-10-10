const vertexCode = `#version 300 es
  in vec2 a_position;

  uniform vec2 u_scale;
  uniform vec2 u_translation;

  void main() {
    vec2 position = (a_position + u_translation) / u_scale;

    gl_Position = vec4(position, 0, 1);
  }
`

export function makeShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

export function makeProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

export function setRectangle(
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const x1 = x
  const x2 = x + width
  const y1 = y
  const y2 = y + height

  const vertices = new Float32Array([
    x1,
    y1,
    x2,
    y1,
    x1,
    y2,
    x1,
    y2,
    x2,
    y1,
    x2,
    y2,
  ])
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
}
