"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GUI } from "dat.gui"
import useIsMounted from "lib/hooks/useIsMounted"
import { gridSphere } from "lib/utils/3d"

type vec3 = [number, number, number]

export default function BlochSphere() {
  const isMounted = useIsMounted()

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const qubitArrowRef = useRef<THREE.ArrowHelper | null>(null)
  const labelRef = useRef<HTMLDivElement | null>(null)
  const guiRef = useRef<GUI | null>(null)

  const thetaRef = useRef(Math.PI / 2)
  const phiRef = useRef(0)

  useEffect(() => {
    if (!isMounted) return

    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!(canvas && wrapper)) return

    const DEG2RAD = Math.PI / 180
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
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    })
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x888888,
      transparent: false,
      opacity: 0.6,
    })

    const sphere = gridSphere(1, 12, 12, sphereMaterial, lineMaterial)
    scene.add(sphere)

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
    createLabel("|1⟩", [0, -1.1, 0])
    createLabel("|0⟩", [0, 1.1, 0])
    createLabel("|+⟩", [0, 0, 1.1])
    createLabel("|-⟩", [0, 0, -1.1])

    // Qubit
    const updateQubit = () => {
      const qubitVector = new THREE.Vector3()
      qubitVector.z = Math.sin(thetaRef.current) * Math.cos(phiRef.current)
      qubitVector.x = Math.sin(thetaRef.current) * Math.sin(phiRef.current)
      qubitVector.y = Math.cos(thetaRef.current)

      if (qubitArrowRef.current) {
        scene.remove(qubitArrowRef.current)
      }

      const qubitArrow = new THREE.ArrowHelper(
        qubitVector.clone().normalize(),
        new THREE.Vector3(0, 0, 0),
        1,
        0xffff00,
      )
      scene.add(qubitArrow)
      qubitArrowRef.current = qubitArrow
    }

    const updateQubitLabel = () => {
      if (!labelRef.current) return

      const alpha = Math.cos(thetaRef.current / 2)
      const betaMagnitude = Math.sin(thetaRef.current / 2)
      const betaPhase = phiRef.current

      const betaReal = betaMagnitude * Math.cos(betaPhase)
      const betaImag = betaMagnitude * Math.sin(betaPhase)

      const betaStr = `${betaReal.toFixed(2)}${betaImag >= 0 ? "+" : ""}${betaImag.toFixed(2)}i`

      labelRef.current.innerText = `Qubit state: ${alpha.toFixed(2)}|0⟩ + (${betaStr})|1⟩`
    }

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5

    // GUI
    const gui = new GUI()
    guiRef.current = gui
    gui.domElement.style.position = "absolute"
    gui.domElement.style.right = "1rem"
    gui.domElement.style.top = "1rem"
    wrapper.appendChild(gui.domElement)

    const params = {
      theta: thetaRef.current / DEG2RAD,
      phi: phiRef.current,
    }
    gui
      .add(params, "theta", 0, 180)
      .name("θ (polar angle)")
      .onChange((value: number) => {
        thetaRef.current = value * DEG2RAD
        updateQubit()
        updateQubitLabel()
      })
    gui
      .add(params, "phi", 0, 360)
      .name("ϕ (azimuth angle)")
      .onChange((value: number) => {
        phiRef.current = value * DEG2RAD
        updateQubit()
        updateQubitLabel()
      })

    // Handle window resize
    const onResize = () => {
      const { width, height } = wrapper.getBoundingClientRect()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      gui.domElement.style.right = "1rem"
      gui.domElement.style.top = "1rem"
    }
    window.addEventListener("resize", onResize)

    // Render
    const render = () => {
      requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
    }

    render()
    updateQubit()
    updateQubitLabel()

    return () => {
      window.removeEventListener("resize", onResize)
      renderer.dispose()

      if (guiRef.current) {
        guiRef.current.destroy()
        guiRef.current = null
        wrapper.removeChild(gui.domElement)
      }

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
    }
  }, [isMounted])

  return (
    <div ref={wrapperRef} className="relative size-full">
      <div
        ref={labelRef}
        className="pointer-events-none absolute top-1 left-1 text-white"
      />
      <canvas ref={canvasRef} />
    </div>
  )
}
