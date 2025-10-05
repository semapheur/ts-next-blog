"use client"

import useIsMounted from "lib/hooks/useIsMounted"
import { type InstancedArrow, instancedQuiverGrid } from "lib/utils/3d"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// $$ \mathbb{E}_\text{rad} (\mathbb{r}, t) = \frac{-q}{4\pi\epsilon_0 c^2} \frac{1}{\lVert\mathbb{r}\rVert} \mathbb{a}_\perp (t - \frac{\lVert\mathbb{r}\rVert}{c}) $$

interface ChargeData {
  charge: number
  initialPosition: THREE.Vector3
  orbit: (time: number) => THREE.Vector3
}

export default function RadiationField() {
  const isMounted = useIsMounted()

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!isMounted) return

    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!(canvas && wrapper)) return

    const { width, height } = wrapper.getBoundingClientRect()

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5

    // Light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    // Quiver
    const gridSize = 10
    const gridStep = 0.4
    const quiverLength = 2
    const vectorField = (x: number, y: number) => {
      return new THREE.Vector3(0, 0, 1)
    }
    const quivers = instancedQuiverGrid(
      scene,
      gridSize,
      gridStep,
      vectorField,
      quiverLength,
      0xaddfff,
    )
    const grid = new THREE.GridHelper(20, 10, 0x888888, 0x888888)
    grid.rotation.x = Math.PI / 2
    scene.add(grid)

    // Charges
    const createCharge = (
      charge: number,
      position: THREE.Vector3,
      orbit: (time: number) => THREE.Vector3,
    ) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32)
      const color = charge > 0 ? 0xe74c3c : 0x2e86c1
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

    const chargeStrength = 2
    const frequency = 2 * Math.PI * 0.5
    const amplitude = 1
    const charge = createCharge(
      chargeStrength,
      new THREE.Vector3(0, 0, 0),
      (time) => {
        const z = amplitude * Math.cos(frequency * time)
        return new THREE.Vector3(0, 0, z)
      },
    )

    const charges = [charge]

    const analyticAcceleration = (time: number) => {
      const z = -2 * frequency ** 2 * Math.cos(frequency * time)
      return new THREE.Vector3(0, 0, z)
    }

    const calculateAcceleration = (
      orbitFunction: (t: number) => THREE.Vector3,
      time: number,
      delta = 1e-5,
    ) => {
      // Numerical differentiation to find acceleration
      const posPlus = orbitFunction(time + delta)
      const pos = orbitFunction(time)
      const posMinus = orbitFunction(time - delta)

      // Second derivative approximation
      const acceleration = posPlus
        .add(posMinus)
        .sub(pos.multiplyScalar(2))
        .divideScalar(delta * delta)
      return acceleration
    }

    const transverseAcceleration_ = (
      acceleration: THREE.Vector3,
      rUnit: THREE.Vector3,
    ) => {
      const aDotR = acceleration.dot(rUnit)
      return acceleration.clone().sub(rUnit.clone().multiplyScalar(aDotR))
    }

    const transverseAcceleration = (
      acceleration: THREE.Vector3,
      direction: THREE.Vector3,
    ) => {
      // Get component of acceleration parallel to direction
      const parallelComponent = direction
        .clone()
        .multiplyScalar(acceleration.dot(direction))

      // Subtract parallel component to get perpendicular component
      return acceleration.clone().sub(parallelComponent)
    }

    const electricFieldAtPoint = (
      point: THREE.Vector3,
      chargeData: ChargeData,
      time: number,
    ) => {
      const c = 2
      const epsilon0 = 0.25
      const k = -chargeData.charge / (4 * Math.PI * epsilon0 * c * c)

      const chargePosition = chargeData.orbit(time)
      const r = point.clone().sub(chargePosition)
      const rLength = r.length()

      if (rLength < 1e-5) return new THREE.Vector3(0, 0, 0)

      const timeRetarded = time - rLength / c
      //const aRetarded = calculateAcceleration(chargeData.orbit, timeRetarded)
      const aRetarded = analyticAcceleration(timeRetarded)
      const rUnit = r.clone().normalize()
      const aPerpendicular = transverseAcceleration(aRetarded, rUnit)

      const electricField = aPerpendicular
        .multiplyScalar(k)
        .divideScalar(rLength)
      return electricField
    }

    const updateElectricField = (
      quiver: InstancedArrow,
      charges: THREE.Object3D[],
      gridSize: number,
      gridStep: number,
      time: number,
    ) => {
      let index = 0

      // Loop through the same grid points used when creating the quiver
      for (let x = -gridSize; x <= gridSize; x += gridStep) {
        for (let y = -gridSize; y <= gridSize; y += gridStep) {
          const position = new THREE.Vector3(x, y, 0)

          // Calculate total electric field at this position
          const totalElectricField = new THREE.Vector3(0, 0, 0)

          charges.forEach((charge) => {
            const data = charge.userData.oscillation as ChargeData
            const electricField = electricFieldAtPoint(position, data, time)
            totalElectricField.add(electricField)
          })

          // Update the arrow at this index in the instanced quiver
          quiver.setArrowFromVector(index, position, totalElectricField)

          index++
        }
      }
      quiver.finalizeUpdate()
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
    const updateFrequency = 60 // updates per second
    const updateInterval = 1 / updateFrequency

    const animate = () => {
      requestAnimationFrame(animate)

      const time = clock.getElapsedTime()
      if (time - lastUpdateTime >= updateInterval) {
        updateCharges(time)
        updateElectricField(quivers, charges, gridSize, gridStep, time)
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
