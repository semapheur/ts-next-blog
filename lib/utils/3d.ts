import * as THREE from "three"

export class ThickArrowHelper extends THREE.Object3D {
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
    const shaftMat = new THREE.MeshBasicMaterial({ color })
    this.shaft = new THREE.Mesh(shaftGeom, shaftMat)
    this.shaft.position.y = shaftLength / 2 // Cylinder's center is in the middle
    this.shaft.rotation.x = Math.PI / 2 // Make cylinder align along z-axis first

    // Head (cone)
    const headGeom = new THREE.ConeGeometry(headRadius, headLength, 8)
    const headMat = new THREE.MeshBasicMaterial({ color })
    this.head = new THREE.Mesh(headGeom, headMat)
    this.head.position.y = shaftLength / 2
    this.head.position.z = (headLength + shaftLength) / 2 // Cone's base is at the end of the cylinder
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
    headLength: number,
    shaftRadius = this.shaftRadius,
    headRadius = this.headRadius,
  ) {
    this.currentLength = length
    this.currentHeadLength = headLength

    if (shaftRadius !== this.shaftRadius) {
      this.shaftRadius = shaftRadius
    }

    if (headRadius !== this.headRadius) {
      this.headRadius = headRadius
    }

    const shaftLength = Math.max(0, length - headLength)

    // Update shaft
    this.arrowGroup.remove(this.shaft)
    const shaftGeom = new THREE.CylinderGeometry(
      shaftRadius,
      shaftRadius,
      shaftLength,
      8,
    )
    const shaftMat = (this.shaft.material as THREE.MeshBasicMaterial).clone()
    this.shaft.geometry.dispose()
    this.shaft = new THREE.Mesh(shaftGeom, shaftMat)
    this.shaft.position.y = shaftLength / 2
    this.shaft.rotation.x = Math.PI / 2
    this.arrowGroup.add(this.shaft)

    // Update head
    this.arrowGroup.remove(this.head)
    const headGeom = new THREE.ConeGeometry(headRadius, headLength, 8)
    const headMat = (this.head.material as THREE.MeshBasicMaterial).clone()
    this.head.geometry.dispose()
    this.head = new THREE.Mesh(headGeom, headMat)
    this.head.position.y = shaftLength / 2
    this.head.position.z = (headLength + shaftLength) / 2
    this.head.rotation.x = Math.PI / 2
    this.arrowGroup.add(this.head)
  }

  setFromVector(vector: THREE.Vector3) {
    const length = vector.length()
    const dir = vector.clone().normalize()

    this.setPositionAndDirection(this.position, dir)

    const headLength = Math.min(this.currentHeadLength, length * 0.3)
    this.resize(length, headLength)
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
  arrowLength: number,
  arrowColor: number,
) {
  const arrows: ThickArrowHelper[] = []

  for (let x = -gridSize; x <= gridSize; x += gridStep) {
    for (let y = -gridSize; y <= gridSize; y += gridStep) {
      const position = new THREE.Vector3(x, y, 0)
      const dir = new THREE.Vector3(1, 0, 0)
      const arrow = new ThickArrowHelper(dir, position, arrowLength, arrowColor)
      scene.add(arrow)
      arrows.push(arrow)
    }
  }

  return arrows
}
