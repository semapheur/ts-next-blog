"use client"

import useIsMounted from "lib/hooks/useIsMounted"
import { quiverGrid } from "lib/utils/3d"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// $$ \mathbb{E}_\text{rad} (\mathbb{r}, t) = \frac{-q}{4\pi\epsilon_0 c^2} \frac{1}{\lVert\mathbb{r}\rVert} \mathbb{a}_\perp (t - \frac{\lVert\mathbb{r}\rVert}{c}) $$

type ChargeData = {
  charge: number
  initialPosition: THREE.Vector3
  orbit: (time: number) => THREE.Vector3
}

export default function ElectricField() {
  const isMounted = useIsMounted()

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!isMounted) return

    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!(canvas && wrapper)) return

    const { width, height } = wrapper.getBoundingClientRect()

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 60)
    camera.lookAt(0, 0, 0)

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5

    // Light
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)

    const quiverLength = 2
    const vectorField = (x: number, y: number) => {
      return new THREE.Vector3(0, 0, 1)
    }
    const quivers = quiverGrid(
      scene,
      100,
      2,
      quiverLength,
      0x00ff00,
      vectorField,
    )
    const grid = new THREE.GridHelper(200, 50, 0x888888, 0x888888)
    grid.rotation.x = Math.PI / 2
    scene.add(grid)

    // Charges
    const createCharge = (
      charge: number,
      position: THREE.Vector3,
      orbit: (time: number) => THREE.Vector3,
    ) => {
      const geometry = new THREE.SphereGeometry(1, 16, 16)
      const color = charge > 0 ? 0xff0000 : 0x0000ff
      const material = new THREE.MeshBasicMaterial({ color })
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.copy(position)
      scene.add(sphere)

      sphere.userData.oscillation = {
        charge,
        initialPosition: position.clone(),
        orbit,
      }
      return sphere
    }

    const frequency = 0.5
    const charge = createCharge(1, new THREE.Vector3(0, 0, 0), (time) => {
      const z = 2 * Math.cos(frequency * time * 2 * Math.PI)
      return new THREE.Vector3(0, 0, z)
    })

    const charges = [charge]

    const calculateAcceleration = (
      orbit: (time: number) => THREE.Vector3,
      time: number,
      h = 1e-5,
    ) => {
      // Numerical second derivative using central difference
      const pos1 = orbit(time - h)
      const pos2 = orbit(time)
      const pos3 = orbit(time + h)

      // Second derivative approximation
      return new THREE.Vector3()
        .copy(pos3)
        .sub(pos2.clone().multiplyScalar(2))
        .add(pos1)
        .divideScalar(h * h)
    }

    const transverseAcceleration = (
      acceleration: THREE.Vector3,
      rUnit: THREE.Vector3,
    ) => {
      const aDotR = acceleration.dot(rUnit)
      return acceleration.clone().sub(rUnit.clone().multiplyScalar(aDotR))
    }

    const electricFieldAtPoint = (
      point: THREE.Vector3,
      chargeData: ChargeData,
      time: number,
    ) => {
      const c = 1
      const epsilon0 = 1
      const k = -1 / (4 * Math.PI * epsilon0 * c * c)

      const chargePosition = chargeData.orbit(time)
      const r = point.clone().sub(chargePosition)
      const rLength = r.length()

      if (rLength < 1e-5) return new THREE.Vector3(0, 0, 0)

      const timeRetarded = time - rLength / c
      const aRetarded = calculateAcceleration(chargeData.orbit, timeRetarded)
      const rUnit = r.clone().normalize()
      const aPerpendicular = transverseAcceleration(aRetarded, rUnit)

      const electricField = aPerpendicular
        .clone()
        .multiplyScalar((k * chargeData.charge) / rLength)
      return electricField
    }

    const updateElectricField = (time: number) => {
      quivers.forEach((quiver) => {
        const totalElectricField = new THREE.Vector3(0, 0, 0)
        charges.forEach((charge) => {
          const data = charge.userData.oscillation as ChargeData
          const electricFieldAtCharge = electricFieldAtPoint(
            quiver.position,
            data,
            time,
          )
          totalElectricField.add(electricFieldAtCharge)
        })
        quiver.setFromVector(totalElectricField.clone().multiplyScalar(20))
      })
    }

    const updateCharges = (time: number) => {
      charges.forEach((charge) => {
        const data = charge.userData.oscillation as ChargeData
        charge.position.copy(data.initialPosition)
        charge.position.add(data.orbit(time).clone().sub(data.initialPosition))
      })
    }

    const onResize = () => {
      const { width, height } = wrapper.getBoundingClientRect()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", onResize)

    const clock = new THREE.Clock()

    let lastUpdateTime = 0
    const updateFrequency = 30 // updates per second
    const updateInterval = 1 / updateFrequency

    const animate = () => {
      requestAnimationFrame(animate)

      const time = clock.getElapsedTime()
      if (time - lastUpdateTime >= updateInterval) {
        updateCharges(time)
        updateElectricField(time)
        lastUpdateTime = time
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("resize", onResize)

      renderer.dispose()

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
    <div className="size-full" ref={wrapperRef}>
      <canvas ref={canvasRef} />
    </div>
  )
}
