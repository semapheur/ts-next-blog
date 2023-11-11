function initBuffers(gl: WebGL2RenderingContext, vertices: number[]) {
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  )
}