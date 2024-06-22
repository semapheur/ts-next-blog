'use client'
import { useEffect, useRef } from 'react'

import * as THREE from 'three'

import starfieldVertexShader from './shaders/starfield_vs.glsl'
import starfieldFragmentShader from './shaders/starfield_fs.glsl'

class PyramidBloomPass {
  vertexShader: string
  blurFragmentShader: string
  drawFragmentShader: string
  bloomMultiplierColor: THREE.Vector3
  bloomFalloffColor: THREE.Vector3
  totalBrightnessFactor: THREE.Vector3
  blur1Shader: THREE.ShaderMaterial
  blur1FirstShader: THREE.ShaderMaterial
  drawShader: THREE.ShaderMaterial
  enabled: boolean
  needsSwap: boolean
  clear: boolean
  camera: THREE.OrthographicCamera
  scene: THREE.Scene
  downsampledBuffer: THREE.WebGLRenderTarget[]
  renderer: THREE.WebGLRenderer
  maskActive: boolean
  quad: THREE.Mesh

  constructor(custom_color_function?: string) {
    this.vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `
    this.blurFragmentShader = `
      uniform vec2 d0;
      uniform vec2 d1;
      uniform vec2 d2;
      uniform vec2 d3;
      varying vec2 vUv;
      
      uniform sampler2D color_texture;
      uniform vec2 uv_scale;
      uniform float blur_amount;

      #ifdef CUSTOM_COLOR_FUNC
        CUSTOM_COLOR_FUNC
      #else
        vec4 customColorFunc(vec4 c) {
          return clamp(c, 0.0, 60000.0);
        }
      #endif

      void main() {
        vec4 c = blur_amount * (
          customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d0)) +
          customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d1)) +
          customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d2)) +
          customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d3))
        );
        c.w = 1.0;
        gl_FragColor = c;
      }
    `
    this.drawFragmentShader = `
      varying vec2 vUv;
      uniform sampler2D color_texture;
      uniform vec3 color_multiplier;
      uniform vec2 uv_scale;

      void main() {
        vec4 c = texture2D(color_texture, vUv * uv_scale) * vec4(color_multiplier, 1.0);
        gl_FragColor = vec4(c.rgb, 1.0);
      }
    `
    this.bloomMultiplierColor = new THREE.Vector3(1.0, 1.0, 1.0)
    this.bloomFalloffColor = new THREE.Vector3(1.0, 1.0, 1.0)

    this.totalBrightnessFactor = new THREE.Vector3(1.0, 1.0, 1.0)

    const params: THREE.ShaderMaterialParameters = {
      vertexShader: this.vertexShader,
      fragmentShader: this.blurFragmentShader,
      uniforms: {
        blur_amount: { value: 0.25 },
        d0: { value: new THREE.Vector2(0.0, 0.0) },
        d1: { value: new THREE.Vector2(0.0, 0.0) },
        d2: { value: new THREE.Vector2(0.0, 0.0) },
        d3: { value: new THREE.Vector2(0.0, 0.0) },
        color_texture: { value: new THREE.Texture() },
        uv_scale: { value: new THREE.Vector2(1.0, 1.0) },
      },
    }

    this.blur1Shader = new THREE.ShaderMaterial(params)

    if (custom_color_function) {
      params.defines = { CUSTOM_COLOR_FUNC: custom_color_function }
    }

    this.blur1FirstShader = new THREE.ShaderMaterial(params)

    this.drawShader = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      transparent: true,
      fragmentShader: this.drawFragmentShader,
      uniforms: {
        color_texture: { value: new THREE.Texture() },
        color_multiplier: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uv_scale: { value: new THREE.Vector2(1.0, 1.0) },
      },
    })

    this.enabled = true
    this.needsSwap = false
    this.clear = false

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.scene = new THREE.Scene()

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), undefined)
    this.downsampledBuffer = []
  }

  downsampleOne(
    src: THREE.WebGLRenderTarget,
    dest: THREE.WebGLRenderTarget,
    shader: THREE.ShaderMaterial,
  ) {
    const deltaScale = 0.75
    if (
      dest.width !== Math.floor(src.width / 2) ||
      dest.height !== Math.floor(src.height / 2)
    ) {
      dest.setSize(Math.floor(src.width / 2), Math.floor(src.height / 2))
    }

    this.renderer.setRenderTarget(dest)

    this.quad.material = shader
    shader.uniforms.d0.value = new THREE.Vector2(
      -deltaScale / src.width,
      -deltaScale / src.height,
    )
    shader.uniforms.d1.value = new THREE.Vector2(
      deltaScale / src.width,
      -deltaScale / src.height,
    )
    shader.uniforms.d2.value = new THREE.Vector2(
      -deltaScale / src.width,
      deltaScale / src.height,
    )
    shader.uniforms.d3.value = new THREE.Vector2(
      deltaScale / src.width,
      deltaScale / src.height,
    )
    shader.uniforms.color_texture.value = src.texture
    shader.uniforms.uv_scale.value.set(
      src.width % 2 === 1 ? 1.0 - 1.0 / src.width : 1.0,
      src.height % 2 === 1 ? 1.0 - 1.0 / src.height : 1.0,
    )
    this.renderer.render(this.scene, this.camera)
  }

  downsampleAll(baseFB: THREE.WebGLRenderTarget) {
    this.downsampledBuffer[0] = baseFB
    let src = baseFB
    let i: number
    for (i = 1; src.width > 3 && src.height > 3; i++) {
      if (!this.downsampledBuffer[i]) {
        const params = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: baseFB.texture.type,
          depthBuffer: false,
          stencilBuffer: false,
          generateMipmaps: false,
        }
        this.downsampledBuffer[i] = new THREE.WebGLRenderTarget(
          Math.floor(src.width / 2),
          Math.floor(src.height / 2),
          params,
        )
      }
      this.downsampleOne(src, this.downsampledBuffer[i], this.blur1Shader)
      src = this.downsampledBuffer[i]
    }
    const n_buffers = i
    while (i < this.downsampledBuffer.length) {
      if (this.downsampledBuffer[i]) this.downsampledBuffer[i].dispose()
      delete this.downsampledBuffer[i]
      i++
    }
    this.downsampledBuffer.length = n_buffers
  }

  upsampleOne(src: THREE.WebGLRenderTarget, dest: THREE.WebGLRenderTarget) {
    this.quad.material = this.drawShader
    this.drawShader.uniforms.color_texture.value = src.texture
    this.drawShader.uniforms.uv_scale.value.set(
      dest.width / (src.width * 2.0),
      dest.height / (src.height * 2.0),
    )

    const autoClear = this.renderer.autoClear
    const autorClearColor = this.renderer.autoClearColor
    this.renderer.autoClear = false
    this.renderer.autoClearColor = false

    this.renderer.setRenderTarget(dest)
    this.renderer.render(this.scene, this.camera)
    this.renderer.autoClear = autoClear
    this.renderer.autoClearColor = autorClearColor
  }

  upsampleAll() {
    this.drawShader.transparent = true
    this.drawShader.blending = THREE.CustomBlending
    this.drawShader.blendSrc = THREE.OneFactor
    this.drawShader.blendDst = THREE.OneFactor
    this.drawShader.depthTest = false
    this.drawShader.depthWrite = false
    this.drawShader.uniforms.color_multiplier.value = this.bloomFalloffColor

    for (let i = this.downsampledBuffer.length - 1; i > 1; --i) {
      this.upsampleOne(this.downsampledBuffer[i], this.downsampledBuffer[i - 1])
      this.totalBrightnessFactor.multiply(
        this.drawShader.uniforms.color_multiplier.value,
      )
      this.totalBrightnessFactor.add(new THREE.Vector3(1.0, 1.0, 1.0))
    }
    this.drawShader.uniforms.color_multiplier.value = this.bloomMultiplierColor
    if (this.downsampledBuffer.length > 1) {
      this.upsampleOne(this.downsampledBuffer[1], this.downsampledBuffer[0])
      this.totalBrightnessFactor.multiply(
        this.drawShader.uniforms.color_multiplier.value,
      )
      this.totalBrightnessFactor.add(new THREE.Vector3(1.0, 1.0, 1.0))
    }
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    delta: number | null,
    maskActive: boolean,
  ) {
    this.totalBrightnessFactor.set(1, 1, 1)
    this.renderer = renderer

    const oldRenderTarget = this.renderer.getRenderTarget()
    const context = this.renderer.getContext()
    const oldSetColorWrite = renderer.state.setMaterial

    if (readBuffer.texture.format === THREE.RGBAFormat) {
      renderer.state.setMaterial = () => {}
    }

    this.maskActive = maskActive

    if (maskActive) context.disable(context.STENCIL_TEST)

    this.downsampleAll(readBuffer)
    this.upsampleAll()

    if (readBuffer.texture.format === THREE.RGBAFormat) {
      context.colorMask(true, true, true, true)
      renderer.state.setMaterial = oldSetColorWrite
    }
    this.renderer.setRenderTarget(oldRenderTarget)
  }
}

function BitDeinterlace(v: number): number[] {
  const result = [0, 0, 0]
  let i = 0
  while (v) {
    result[0] = result[0] | ((v & 1) << i)
    result[1] = result[1] | ((v & 2) << i)
    result[2] = result[0] | ((v & 4) << i)
    v >>= 3
    i++
  }
  result[1] = result[1] >> 1
  result[2] = result[2] >> 2
  return result
}

export default function SpecialRelativity() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!(canvas && wrapper)) return

    const uniformsStars = {
      offset: { value: new THREE.Vector3(0, 0, 0) },
      brightness_scale: { value: 0.1 },
      velocity: { value: new THREE.Vector3(0, 0, 0) },
      frac_cam_pos: { value: new THREE.Vector3(0, 0, 0) },
      lorentz: { value: new THREE.Matrix4() },
    }

    const { width, height } = wrapper.getBoundingClientRect()

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
    })

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setSize(width, height)

    const bloomPass = new PyramidBloomPass()
    bloomPass.bloomFalloffColor = new THREE.Vector3(0.7, 0.7, 0.7)
    bloomPass.bloomMultiplierColor = new THREE.Vector3(0.1, 0.1, 0.1)

    const supportsHalf =
      renderer.extensions.get('OES_texture_half_float') ||
      renderer.extensions.get('OES_texture_half_float_linear')
    const supportsFloat =
      renderer.extensions.get('OES_texture_float') ||
      renderer.extensions.get('OES_texture_float_linear')

    let textureType: 1009 | 1015 | 1016 = THREE.UnsignedByteType

    if (supportsHalf) {
      textureType = THREE.HalfFloatType
    } else if (supportsFloat) {
      textureType = THREE.FloatType
    }

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 1)

    const scene = new THREE.Scene()
    const geometry = new THREE.BufferGeometry()

    const levels = 5
    const bitsPerComponent = 5
    const n = 1 << (bitsPerComponent * 3)
    const offset = 0.5 - (1 << (bitsPerComponent - 1))
    const maxR2 = offset * offset
    const positions = new Float32Array(levels * n * 4)
    let idx = 0

    for (let level = 0; level < levels; level++) {
      const scale = 1 << level
      for (let i = 0; i < n; i++) {
        const pos = BitDeinterlace(i)
        const r2 =
          (pos[0] + offset) * (pos[0] + offset) +
          (pos[1] + offset) * (pos[1] + offset) +
          (pos[2] + offset) * (pos[2] + offset)
        if (r2 > maxR2) continue
        positions[idx++] = (pos[0] + offset) * scale
        positions[idx++] = (pos[1] + offset) * scale
        positions[idx++] = (pos[2] + offset) * scale
        positions[idx++] = level
      }
    }

    const attrib = new THREE.Float32BufferAttribute(positions, 4)
    attrib.count = idx / 4
    geometry.setAttribute('position', attrib)
    geometry.setAttribute('my_position', attrib)
    geometry.setDrawRange(0, idx / 4)

    const material = new THREE.ShaderMaterial({
      uniforms: uniformsStars,
      vertexShader: starfieldVertexShader,
      fragmentShader: starfieldFragmentShader,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    })
    const meshStars = new THREE.Points(geometry, material)
    meshStars.frustumCulled = false

    scene.add(meshStars)

    let globalTime = 0
    let prevTime = -1
    function animate(time: number) {
      if (prevTime === -1) prevTime = time
      globalTime = time
      const dt = time - prevTime

      requestAnimationFrame(animate)

      //uniformsStars.offset.value.set(spaceship.offset.x % grid_wraparound, spaceship.offset.y % grid_wraparound, spaceship.offset.z % grid_wraparound)

      renderer.render(scene, camera)
      bloomPass.render(renderer, renderTarget, renderTarget, null, false)

      prevTime = time
    }

    animate(globalTime)
  }, [])

  return (
    <div ref={wrapperRef} className='h-full'>
      <canvas ref={canvasRef} />
    </div>
  )
}
