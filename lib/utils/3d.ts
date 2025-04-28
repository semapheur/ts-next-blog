import * as THREE from "three"
import { hexNumberToColorString } from "./color"

class SpriteArrow extends THREE.Sprite {
  private direction: THREE.Vector3
  private length: number
  private color: number

  constructor(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    color: number,
  ) {
    const material = new THREE.SpriteMaterial({
      map: createArrowTexture(hexNumberToColorString(color)),
      color,
      transparent: true,
      alphaTest: 0.5,
    })
    super(material)

    this.position.copy(position)
    this.direction = direction.clone().normalize()
    this.length = length

    this.setLength(length)
    this.color = color
  }

  setDirection(direction: THREE.Vector3) {
    this.direction.copy(direction.clone().normalize())
    this.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      this.direction,
    )
  }

  setLength(length: number) {
    this.length = length
    this.scale.set(length, length, 1)
  }

  update() {
    const dir = this.direction

    // Make sprite face camera but indicate 3D direction
    // Project the 3D direction onto the XY plane for basic rotation
    const xyProjection = new THREE.Vector2(dir.x, dir.y).normalize()
    let angleXY = Math.atan2(xyProjection.y, xyProjection.x)

    // Handle case when vector is primarily along Z-axis
    const zDominant =
      Math.abs(dir.z) > Math.max(Math.abs(dir.x), Math.abs(dir.y))

    if (zDominant) {
      // When pointing mostly along Z, use a different visual treatment
      // We'll make it point straight up/down but modify appearance
      angleXY = Math.PI / 2 // Point vertically on sprite

      // We apply a special scale to indicate Z direction
      const scaleX = this.length / 3 // Make it wider/narrower
      const scaleY = this.length // Keep length proportional to vector magnitude
      this.scale.set(scaleX, scaleY, 1)

      // Indicate z-direction with opacity and color modification
      const material = this.material as THREE.SpriteMaterial
      if (dir.z > 0) {
        // Coming out of screen - brighter
        material.opacity = 1.0

        // Optional: tint towards a color to indicate +Z
        const baseColor = new THREE.Color(material.color.getHex())
        material.color.setRGB(
          baseColor.r,
          Math.min(baseColor.g * 1.5, 1.0),
          baseColor.b,
        )
      } else {
        // Going into screen - dimmer
        material.opacity = 0.7

        // Optional: tint towards a color to indicate -Z
        const baseColor = new THREE.Color(material.color.getHex())
        material.color.setRGB(
          baseColor.r,
          baseColor.g,
          Math.min(baseColor.b * 1.5, 1.0),
        )
      }
    } else {
      // Normal case - vector has significant XY component

      // Scale the arrow based on the projection and vector length
      const scaleX = this.length // Length of arrow
      const scaleY = this.length / 3 // Width of arrow

      // Adjust for z-component (slant effect)
      const zFactor = Math.abs(dir.z) / 2
      const zAdjustedY = scaleY * (1 + zFactor)

      this.scale.set(scaleX, zAdjustedY, 1)
      this.material.rotation = -angleXY

      // Reset opacity and color if changed from Z-dominant mode
      this.material.opacity = 1.0
      this.material.color.setHex(this.color)
    }
  }
}
export class ThickArrow extends THREE.Object3D {
  private arrowGroup: THREE.Group
  private shaft: THREE.Mesh
  private head: THREE.Mesh
  private currentLength: number
  private currentHeadLength: number
  private shaftRadius: number
  private headRadius: number

  constructor(
    dir: THREE.Vector3,
    origin: THREE.Vector3,
    length = 1,
    color = 0xffff00,
    shaftRadius = 0.05,
    headLength = 0.2,
    headRadius = 0.1,
  ) {
    super()

    this.currentLength = length
    this.currentHeadLength = headLength
    this.shaftRadius = shaftRadius
    this.headRadius = headRadius

    dir = dir.clone().normalize()
    this.position.copy(origin)

    const shaftLength = Math.max(0, length - headLength)

    // Shaft (cylinder)
    const shaftGeom = new THREE.CylinderGeometry(
      shaftRadius,
      shaftRadius,
      shaftLength,
      8,
    )
    shaftGeom.translate(0, shaftLength / 2, 0)
    const shaftMat = new THREE.MeshBasicMaterial({ color })
    this.shaft = new THREE.Mesh(shaftGeom, shaftMat)
    this.shaft.rotation.x = Math.PI / 2 // Make cylinder align along z-axis first

    // Head (cone)
    const headGeom = new THREE.ConeGeometry(headRadius, headLength, 8)
    headGeom.translate(0, -headLength / 2, 0)

    const headMat = new THREE.MeshBasicMaterial({ color })
    this.head = new THREE.Mesh(headGeom, headMat)
    this.head.position.z = shaftLength + headLength / 2
    this.head.rotation.x = Math.PI / 2 // Cone points along z-axis

    // Group shaft and head together
    this.arrowGroup = new THREE.Group()
    this.arrowGroup.add(this.shaft)
    this.arrowGroup.add(this.head)

    // Now rotate the whole arrowGroup to match direction
    this.setDirection(dir)

    this.add(this.arrowGroup)
  }

  setPosition(position: THREE.Vector3) {
    this.position.copy(position)
  }

  setDirection(dir: THREE.Vector3) {
    const normalizedDir = dir.clone().normalize()
    this.arrowGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normalizedDir,
    )
  }

  setPositionAndDirection(origin: THREE.Vector3, dir: THREE.Vector3): void {
    this.setPosition(origin)
    this.setDirection(dir)
  }

  resize(
    length: number,
    headLength = this.currentHeadLength,
    shaftRadius = this.shaftRadius,
    headRadius = this.headRadius,
  ) {
    if (length < 0.0001) {
      this.arrowGroup.visible = false
      return
    }

    this.arrowGroup.visible = true

    // Store the new values
    const oldLength = this.currentLength
    const oldHeadLength = this.currentHeadLength
    this.currentLength = length
    this.currentHeadLength = headLength

    // Update radius values if changed
    const shaftRadiusChanged = shaftRadius !== this.shaftRadius
    const headRadiusChanged = headRadius !== this.headRadius

    if (shaftRadiusChanged) {
      this.shaftRadius = shaftRadius
    }

    if (headRadiusChanged) {
      this.headRadius = headRadius
    }

    const shaftLength = Math.max(0.0001, length - headLength)
    const oldShaftLength = Math.max(0.0001, oldLength - oldHeadLength)

    // Update shaft
    if (
      Math.abs(shaftLength / oldShaftLength - 1) > 0.01 ||
      shaftRadiusChanged
    ) {
      // Remove old shaft
      this.arrowGroup.remove(this.shaft)
      const shaftMat = (this.shaft.material as THREE.MeshBasicMaterial).clone()
      this.shaft.geometry.dispose()

      // Create new shaft geometry with correct dimensions
      const shaftGeom = new THREE.CylinderGeometry(
        this.shaftRadius,
        this.shaftRadius,
        shaftLength,
        8,
      )
      shaftGeom.translate(0, shaftLength / 2, 0)

      // Create new shaft mesh
      this.shaft = new THREE.Mesh(shaftGeom, shaftMat)
      this.shaft.rotation.x = Math.PI / 2
      this.arrowGroup.add(this.shaft)
    }

    // Updat head
    if (Math.abs(headLength / oldHeadLength - 1) > 0.01 || headRadiusChanged) {
      // Remove old head
      this.arrowGroup.remove(this.head)
      const headMat = (this.head.material as THREE.MeshBasicMaterial).clone()
      this.head.geometry.dispose()

      // Create new head geometry with correct dimensions
      const headGeom = new THREE.ConeGeometry(headRadius, headLength, 8)
      headGeom.translate(0, -headLength / 2, 0)

      // Create new head mesh
      this.head = new THREE.Mesh(headGeom, headMat)
      this.head.position.z = shaftLength + headLength / 2
      this.head.rotation.x = Math.PI / 2
      this.arrowGroup.add(this.head)
    } else {
      // Just update the position of the head if only shaft length changed
      this.head.position.z = shaftLength + headLength / 2
    }
  }

  setFromVector(vector: THREE.Vector3) {
    const length = vector.length()
    if (length < this.currentHeadLength) {
      this.arrowGroup.visible = false
      return
    }

    this.arrowGroup.visible = true

    const dir = vector.clone().normalize()

    this.setPositionAndDirection(this.position, dir)
    this.resize(length)
  }
}

export class InstancedArrow extends THREE.Object3D {
  private instancedShaft: THREE.InstancedMesh
  private instancedHead: THREE.InstancedMesh
  private arrows: THREE.Object3D[]
  private tempQuaternion: THREE.Quaternion
  private defaultDir: THREE.Vector3
  private count: number
  private defaultHeadLength: number

  constructor(
    count = 100,
    color = 0xffff00,
    shaftRadius = 0.05,
    headLength = 0.2,
    headRadius = 0.1,
  ) {
    super()

    this.count = count
    this.defaultHeadLength = headLength
    this.defaultDir = new THREE.Vector3(0, 0, 1)
    this.arrows = []
    this.tempQuaternion = new THREE.Quaternion()

    // Create shaft geometry
    const shaftGeom = new THREE.CylinderGeometry(
      shaftRadius,
      shaftRadius,
      1, // Default unit length (will be scaled)
      8,
    )
    // Position cylinder so its base is at origin, points along +Y
    shaftGeom.translate(0, 0.5, 0)
    shaftGeom.rotateX(Math.PI / 2) // Make it point along Z

    // Create head geometry
    const headGeom = new THREE.ConeGeometry(headRadius, headLength, 8)
    headGeom.translate(0, headLength / 2, 0)
    headGeom.rotateX(Math.PI / 2) // Make cone point along Z

    // Create material
    const material = new THREE.MeshBasicMaterial({ color })

    // Create instanced meshes
    this.instancedShaft = new THREE.InstancedMesh(shaftGeom, material, count)
    this.instancedHead = new THREE.InstancedMesh(headGeom, material, count)

    // By default all instances are hidden
    this.instancedShaft.count = 0
    this.instancedHead.count = 0

    this.add(this.instancedShaft)
    this.add(this.instancedHead)

    // Initialize arrow data placeholders
    for (let i = 0; i < count; i++) {
      this.arrows.push(new THREE.Object3D())
    }
  }

  setArrow(
    index: number,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    headLength: number = this.defaultHeadLength,
  ): void {
    if (index >= this.count || length <= 0.0001) return

    const arrow = this.arrows[index]
    const shaftLength = Math.max(0.0001, length - headLength)

    // Position and orientation for the full arrow
    arrow.position.copy(position)
    this.tempQuaternion.setFromUnitVectors(
      this.defaultDir,
      direction.clone().normalize(),
    )
    arrow.quaternion.copy(this.tempQuaternion)

    // Update shaft instance
    arrow.scale.set(1, 1, shaftLength)
    arrow.updateMatrix()
    this.instancedShaft.setMatrixAt(index, arrow.matrix)

    // Position the head at the end of the shaft
    arrow.position.copy(position)
    // Move along the direction vector by the shaft length
    arrow.position.add(
      direction.clone().normalize().multiplyScalar(shaftLength),
    )
    arrow.scale.set(1, 1, 1) // Reset scale for the head
    arrow.updateMatrix()
    this.instancedHead.setMatrixAt(index, arrow.matrix)

    // Ensure instance counts are updated
    this.instancedShaft.count = Math.max(this.instancedShaft.count, index + 1)
    this.instancedHead.count = Math.max(this.instancedHead.count, index + 1)

    // Mark instance matrices as needing update
    this.instancedShaft.instanceMatrix.needsUpdate = true
    this.instancedHead.instanceMatrix.needsUpdate = true
  }

  setArrowFromVector(
    index: number,
    position: THREE.Vector3,
    vector: THREE.Vector3,
    scale = 1,
  ): void {
    const length = vector.length() * scale
    if (length < 0.0001) return

    const direction = vector.clone().normalize()
    this.setArrow(index, position, direction, length)
  }

  // Set visibility of all instances
  setVisible(visible: boolean): void {
    this.instancedShaft.visible = visible
    this.instancedHead.visible = visible
  }

  // Set color for all instances
  setColor(color: number): void {
    ;(this.instancedShaft.material as THREE.MeshBasicMaterial).color.set(color)
    ;(this.instancedHead.material as THREE.MeshBasicMaterial).color.set(color)
  }

  // Get and set the full count
  get arrowCount(): number {
    return this.instancedShaft.count
  }

  set arrowCount(count: number) {
    this.instancedShaft.count = count
    this.instancedHead.count = count
  }

  // Clean up resources
  dispose(): void {
    this.instancedShaft.geometry.dispose()
    this.instancedHead.geometry.dispose()

    if (this.instancedShaft.parent) {
      this.instancedShaft.parent.remove(this.instancedShaft)
    }
    if (this.instancedHead.parent) {
      this.instancedHead.parent.remove(this.instancedHead)
    }
  }
}

function createLatitudeLines(
  radius: number,
  segments: number,
  lineMaterial: THREE.Material,
) {
  const group = new THREE.Group()

  for (let i = 1; i < segments; i++) {
    const y = radius * Math.cos((Math.PI * i) / segments)
    const radiusAtHeight = Math.sqrt(radius * radius - y * y)
    const points: THREE.Vector3[] = []

    for (let j = 0; j <= 64; j++) {
      const theta = (2 * Math.PI * j) / 64
      const x = radiusAtHeight * Math.cos(theta)
      const z = radiusAtHeight * Math.sin(theta)
      points.push(new THREE.Vector3(x, y, z))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, lineMaterial)
    group.add(line)
  }

  return group
}

function createLongitudeLines(
  radius: number,
  segments: number,
  lineMaterial: THREE.Material,
) {
  const group = new THREE.Group()

  for (let i = 0; i < segments; i++) {
    const theta = (2 * Math.PI * i) / segments
    const points: THREE.Vector3[] = []

    for (let j = 0; j <= 64; j++) {
      const phi = (Math.PI * j) / 64
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)
      points.push(new THREE.Vector3(x, y, z))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, lineMaterial)
    group.add(line)
  }

  return group
}

// Create the smooth wireframe sphere
export function gridSphere(
  radius: number,
  latSegments: number,
  lonSegments: number,
  sphereMaterial: THREE.Material,
  lineMaterial: THREE.Material,
) {
  // Create the transparent sphere
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32)
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

  // Add latitude and longitude lines
  const latitudeLines = createLatitudeLines(radius, latSegments, lineMaterial)
  const longitudeLines = createLongitudeLines(radius, lonSegments, lineMaterial)

  sphere.add(latitudeLines)
  sphere.add(longitudeLines)

  return sphere
}

export function quiverGrid(
  scene: THREE.Scene,
  gridSize: number,
  gridStep: number,
  arrowScale: number,
  arrowColor: number,
  vectorField: (x: number, y: number) => THREE.Vector3,
) {
  const arrows: ThickArrow[] = []

  for (let x = -gridSize; x <= gridSize; x += gridStep) {
    for (let y = -gridSize; y <= gridSize; y += gridStep) {
      const position = new THREE.Vector3(x, y, 0)
      const vector = vectorField(x, y)
      const dir = vector.clone().normalize()
      const length = vector.length() * arrowScale
      const arrow = new ThickArrow(dir, position, length, arrowColor)

      scene.add(arrow)
      arrows.push(arrow)
    }
  }

  return arrows
}

function createArrowTexture(color: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Failed to get canvas context")

  // Clear canvas
  context.fillStyle = "rgba(0, 0, 0, 0)"
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Draw arrow
  context.fillStyle = color
  context.beginPath()

  // Arrow shaft
  context.rect(5, 24, 40, 16)

  // Arrow head
  context.moveTo(45, 16)
  context.lineTo(45, 48)
  context.lineTo(64, 32)

  context.closePath()
  context.fill()

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true

  return texture
}

export function instancedQuiverGrid(
  scene: THREE.Scene,
  gridSize: number,
  gridStep: number,
  vectorField: (x: number, y: number) => THREE.Vector3,
  arrowScale = 1,
  arrowColor = 0xffff00,
): InstancedArrow {
  // Calculate total number of points in the grid
  const pointsPerSide = Math.floor((gridSize * 2) / gridStep) + 1
  const totalPoints = pointsPerSide * pointsPerSide

  // Create instanced arrow helper
  const quiver = new InstancedArrow(
    totalPoints,
    arrowColor,
    0.05, // shaft radius
    0.2, // head length
    0.1, // head radius
  )

  // Position and configure all the arrows
  let index = 0
  for (let x = -gridSize; x <= gridSize; x += gridStep) {
    for (let y = -gridSize; y <= gridSize; y += gridStep) {
      const position = new THREE.Vector3(x, y, 0)
      const vector = vectorField(x, y)
      quiver.setArrowFromVector(index, position, vector, arrowScale)
      index++
    }
  }

  // Add the quiver to the scene
  scene.add(quiver)

  // Set the actual count of arrows
  quiver.arrowCount = index

  return quiver
}
