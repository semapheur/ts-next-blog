"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

type vec3 = [number, number, number]

export default function BlochSphere() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!(canvas && wrapper)) return

    const { width, height } = wrapper.getBoundingClientRect()

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(2, 2, 2)

    // Light
    const light = new THREE.PointLight(0xffffff, 1, 100)
    light.position.set(5, 5, 5)
    scene.add(light)

    // Bloch sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: false,
      transparent: true,
      opacity: 0.2,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    const edgesGeometry = new THREE.EdgesGeometry(
      new THREE.SphereGeometry(1, 18, 18),
    )
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xd9dddc,
    })
    const wireframe = new THREE.LineSegments(edgesGeometry, lineMaterial)
    sphere.add(wireframe)

    // Coordinate axes
    const createAxis = (color: number, from: vec3, to: vec3) => {
      const dir = new THREE.Vector3(
        to[0] - from[0],
        to[1] - from[1],
        to[2] - from[2],
      ).normalize()
      const length = new THREE.Vector3(...to).distanceTo(
        new THREE.Vector3(...from),
      )
      const arrowHelper = new THREE.ArrowHelper(
        dir,
        new THREE.Vector3(...from),
        length,
        color,
        0.1,
        0.05,
      )
      return arrowHelper
    }

    scene.add(createAxis(0xff0000, [-1, 0, 0], [1, 0, 0]))
    scene.add(createAxis(0x00ff00, [0, -1, 0], [0, 1, 0]))
    scene.add(createAxis(0x0000ff, [0, 0, -1], [0, 0, 1]))

    // Labels
    const createLabel = (text: string, position: vec3) => {
      const canvas2d = document.createElement("canvas")
      const context = canvas2d.getContext("2d")
      if (!context) return

      //canvas2d.width = 256
      //canvas2d.height = 128
      context.fillStyle = "rgba(0, 0, 0, 0)"
      context.fillRect(0, 0, canvas2d.width, canvas2d.height)
      context.font = "30px Arial"
      context.fillStyle = "rgba(255, 255, 255, 1)"
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.fillText(text, canvas2d.width / 2, canvas2d.height / 2)

      const texture = new THREE.CanvasTexture(canvas2d)
      texture.needsUpdate = true
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(0.6, 0.3, 1)
      sprite.position.set(...position)
      scene.add(sprite)
    }

    createLabel("|i⟩", [1.1, 0, 0])
    createLabel("|-i⟩", [-1.1, 0, 0])
    createLabel("|1⟩", [0, 1.1, 0])
    createLabel("|0⟩", [0, -1.1, 0])
    createLabel("|+⟩", [0, 0, 1.1])
    createLabel("|-⟩", [0, 0, -1.1])

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5

    // Handle window resize
    const onResize = () => {
      const { width, height } = wrapper.getBoundingClientRect()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener("resize", onResize)

    // Render
    const render = () => {
      requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
    }

    render()

    return () => {
      window.removeEventListener("resize", onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="size-full">
      <canvas ref={canvasRef} />
    </div>
  )
}
