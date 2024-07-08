"use client"
import { useEffect, useRef } from "react"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { ColorCorrectionShader } from "three/examples/jsm/shaders/ColorCorrectionShader"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { PyramidBloomPass } from "lib/utils/bloom"

import starfieldVertexShader from "lib/shaders/starfield_vs.glsl"
import fragmentShader from "lib/shaders/standard_fs.glsl"

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

    const useFloatTexture = true
    const colorStorageBias = 0.000061035 * 4.1
    const colorStorageScale = 1 / 64

    const uniformsStars = {
      offset: { value: new THREE.Vector3(0, 0, 0) },
      brightness_scale: { value: 0.01 },
      velocity: { value: new THREE.Vector3(0, 0, 0) },
      frac_cam_pos: { value: new THREE.Vector3(0, 0, 0) },
      lorentz: { value: new THREE.Matrix4() },
    }

    const { width, height } = wrapper.getBoundingClientRect()

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)

    const supportsHalf =
      renderer.extensions.get("OES_texture_half_float") ||
      renderer.extensions.get("OES_texture_half_float_linear")
    const supportsFloat =
      renderer.extensions.get("OES_texture_float") ||
      renderer.extensions.get("OES_texture_float_linear")

    let textureType: THREE.TextureDataType = THREE.UnsignedByteType

    if (supportsHalf) {
      textureType = THREE.HalfFloatType
    } else if (supportsFloat) {
      textureType = THREE.FloatType
    }

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: useFloatTexture ? textureType : THREE.UnsignedByteType,
      depthBuffer: false,
    })

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 1)
    const controls = new OrbitControls(camera, canvas)
    controls.enablePan = false
    controls.enableZoom = false

    const scene = new THREE.Scene()

    const renderScene = new RenderPass(scene, camera)
    const composer = new EffectComposer(renderer, renderTarget)
    composer.addPass(renderScene)

    const bloomPass = new PyramidBloomPass()
    bloomPass.falloffColor = new THREE.Vector3(0.7, 0.7, 0.7)
    bloomPass.multiplierColor = new THREE.Vector3(0.1, 0.1, 0.1)
    //const unrealBloomPass = new UnrealBloomPass(
    //  new THREE.Vector2(2, 2),
    //  1.5,
    //  0.4,
    //  0.85,
    //)
    //composer.addPass(unrealBloomPass)

    const tonePass = new ShaderPass(ColorCorrectionShader)
    composer.addPass(tonePass)
    tonePass.uniforms.addRGB.value = new THREE.Vector3(0, 0, 0)
    tonePass.uniforms.mulRGB.value = new THREE.Vector3(
      1 / colorStorageScale,
      1 / colorStorageScale,
      1 / colorStorageScale,
    )
    tonePass.uniforms.powRGB.value = new THREE.Vector3(0.6, 0.6, 0.6)
    //const outputPass = new OutputPass()
    //composer.addPass(outputPass)

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
    geometry.setAttribute("position", attrib)
    geometry.setAttribute("my_position", attrib)
    geometry.setDrawRange(0, idx / 4)

    const material = new THREE.ShaderMaterial({
      uniforms: uniformsStars,
      vertexShader: starfieldVertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    })
    const meshStars = new THREE.Points(geometry, material)
    meshStars.frustumCulled = false

    scene.add(meshStars)

    const clock = new THREE.Clock()
    function animate() {
      const dt = clock.getDelta()

      controls.update()

      requestAnimationFrame(animate)

      //uniformsStars.offset.value.set(spaceship.offset.x % grid_wraparound, spaceship.offset.y % grid_wraparound, spaceship.offset.z % grid_wraparound)

      composer.render()
      //renderer.render(scene, camera)
    }

    animate()
  }, [])

  return (
    <div ref={wrapperRef} className="h-full">
      <canvas ref={canvasRef} />
    </div>
  )
}
