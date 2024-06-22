'use client'
import {useEffect, useRef} from 'react'

import * as THREE from 'three'

import starfieldVertexShader from './shaders/starfield_vs.glsl'
import starfieldFragmentShader from './shaders/starfield_fs.glsl'

function BitDeinterlace(v: number): number[] {
  const result = [0,0,0]
  let i = 0
  while (v) {
    result[0] = result[0]|((v & 1) << i)
    result[1] = result[1]|((v & 2) << i)
    result[2] = result[0]|((v & 4) << i)
    v >>= 3
    i++
  }
  result[1] = result[1] >> 1
  result[2] = result[2] >> 2
  return result
}

export default function SpecialRelativity() {
  const wrapperRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!(canvas && wrapper)) return

    const uniformsStars = {
      offset: {type: 'v3', value: new THREE.Vector3(0,0,0)},
      brightness_scale: {type: 'f', value: 0.01},
      velocity: {type: 'v3', value: new THREE.Vector3(0,0,0)},
      frac_cam_pos: {type: 'v3', value: new THREE.Vector3(0,0,0)},
      lorentz: {type: 'm4', value: new THREE.Matrix4()},
    }

    const {width, height} = wrapper.getBoundingClientRect()

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 1)

    const scene = new THREE.Scene()
    const geometry = new THREE.BufferGeometry()

    const levels = 5
    const bitsPerComponent = 5
    const n = 1 << (bitsPerComponent * 3)
    const offset = 0.5 - (1 << bitsPerComponent - 1)
    const maxR2 = offset * offset
    const positions = new Float32Array(levels * n * 4)
    let idx = 0

    for (let level=0; level<levels; level++) {
      const scale = 1 << level
      for (let i=0; i<n; i++) {
        const pos = BitDeinterlace(i)
        const r2 = (pos[0] + offset) * (pos[0] + offset) + (pos[1] + offset) * (pos[1] + offset) + (pos[2] + offset) * (pos[2] + offset)
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

    console.log(starfieldVertexShader)

    const material = new THREE.ShaderMaterial({
      uniforms: uniformsStars,
      vertexShader: starfieldVertexShader,
      fragmentShader: starfieldFragmentShader,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor
    })
    const meshStars = new THREE.Points(geometry, material)
    meshStars.frustumCulled = false

    scene.add(meshStars)

  }, [])

  return (
    <div>
      <canvas ref={canvasRef}/>
    </div>
  )
}