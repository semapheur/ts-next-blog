function initBuffers(gl: WebGL2RenderingContext, vertices: number[]) {
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  )
}

const vertexShaderSource = `#version 300 es

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShaderSource = `#version 300 es

  void main() {

  }
`

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
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

function createProgram(
  gl: WebGL2RenderingContext, 
  vertexShader: WebGLShader, 
  fragmentShader: WebGLShader) 
{
  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

/*
export default function WebGl() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (canvas) {
      const gl = canvas.getContext('webgl2')
      if (!gl) return

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
      const program = createProgram(gl, vertexShader, fragmentShader)
      gl.useProgram(program)
    }
  }, [])

  return <canvas ref={canvasRef}/>
}
*/