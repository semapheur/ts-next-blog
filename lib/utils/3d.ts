import * as THREE from "three"

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
  private shaftMaterial: THREE.ShaderMaterial
  private headMaterial: THREE.ShaderMaterial
  private opacities: Float32Array
  private shaftColorAttribute: THREE.InstancedBufferAttribute
  private headColorAttribute: THREE.InstancedBufferAttribute

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
    this.opacities = new Float32Array(count)

    // Fill opacities with 1.0 (fully opaque) initially
    this.opacities.fill(1.0)

    // Create shader materials with built-in opacity support
    const colorVector = new THREE.Color(color)
    const materialParams = {
      transparent: true,
      vertexShader: `
        attribute vec3 instanceColor;
        attribute float opacity;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          vColor = instanceColor;
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          gl_FragColor = vec4(vColor, vOpacity);
        }
      `,
    }

    this.shaftMaterial = new THREE.ShaderMaterial(materialParams)
    this.headMaterial = new THREE.ShaderMaterial(materialParams)

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

    // Create instanced meshes
    this.instancedShaft = new THREE.InstancedMesh(
      shaftGeom,
      this.shaftMaterial,
      count,
    )
    this.instancedHead = new THREE.InstancedMesh(
      headGeom,
      this.headMaterial,
      count,
    )

    // Create and initialize color and opacity attributes
    const shaftColors = new Float32Array(count * 3)
    const headColors = new Float32Array(count * 3)

    // Fill colors with the specified color
    for (let i = 0; i < count; i++) {
      shaftColors[i * 3] = colorVector.r
      shaftColors[i * 3 + 1] = colorVector.g
      shaftColors[i * 3 + 2] = colorVector.b

      headColors[i * 3] = colorVector.r
      headColors[i * 3 + 1] = colorVector.g
      headColors[i * 3 + 2] = colorVector.b
    }

    // Create instance attributes for color
    this.shaftColorAttribute = new THREE.InstancedBufferAttribute(
      shaftColors,
      3,
    )
    this.headColorAttribute = new THREE.InstancedBufferAttribute(headColors, 3)

    // Create instance attributes for opacity
    const shaftOpacityAttribute = new THREE.InstancedBufferAttribute(
      this.opacities,
      1,
    )
    const headOpacityAttribute = new THREE.InstancedBufferAttribute(
      this.opacities,
      1,
    )

    // Add attributes to geometries
    this.instancedShaft.geometry.setAttribute(
      "instanceColor",
      this.shaftColorAttribute,
    )
    this.instancedShaft.geometry.setAttribute("opacity", shaftOpacityAttribute)

    this.instancedHead.geometry.setAttribute(
      "instanceColor",
      this.headColorAttribute,
    )
    this.instancedHead.geometry.setAttribute("opacity", headOpacityAttribute)

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
    if (index >= this.count) return

    // Calculate opacity based on length
    const minLength = 1e-4
    const fadeStartLength = headLength * 4 // Start fading when length is 4x the head length
    let opacity = 1.0

    if (length <= minLength) {
      opacity = 0.0
    } else if (length < fadeStartLength) {
      // Linear interpolation between 0 and 1 based on length
      opacity = Math.max(0.0, length / fadeStartLength)
    }

    // Update opacity for this arrow instance
    this.opacities[index] = opacity

    // Mark opacity attributes as needing update
    ;(
      this.instancedShaft.geometry.getAttribute(
        "opacity",
      ) as THREE.InstancedBufferAttribute
    ).needsUpdate = true
    ;(
      this.instancedHead.geometry.getAttribute(
        "opacity",
      ) as THREE.InstancedBufferAttribute
    ).needsUpdate = true

    // If length is extremely small, we can skip updating the positions
    if (length <= minLength) {
      // Ensure instance counts are updated even for invisible arrows
      this.instancedShaft.count = Math.max(this.instancedShaft.count, index + 1)
      this.instancedHead.count = Math.max(this.instancedHead.count, index + 1)
      return
    }

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

  // This method can be called at the end of a batch update for better performance
  finalizeUpdate(): void {
    ;(
      this.instancedShaft.geometry.getAttribute(
        "opacity",
      ) as THREE.InstancedBufferAttribute
    ).needsUpdate = true
    ;(
      this.instancedHead.geometry.getAttribute(
        "opacity",
      ) as THREE.InstancedBufferAttribute
    ).needsUpdate = true
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
    const colorObj = new THREE.Color(color)

    // Update all instance colors
    for (let i = 0; i < this.count; i++) {
      this.shaftColorAttribute.setXYZ(i, colorObj.r, colorObj.g, colorObj.b)
      this.headColorAttribute.setXYZ(i, colorObj.r, colorObj.g, colorObj.b)
    }

    this.shaftColorAttribute.needsUpdate = true
    this.headColorAttribute.needsUpdate = true
  }

  // Set fade parameters
  setFadeParameters(
    minLength: number,
    fadeStartLengthMultiplier: number,
  ): void {
    // This method allows customizing the fade effect parameters
    // It doesn't immediately update existing arrows, but will affect future calls to setArrow
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

    if (this.instancedShaft.material instanceof THREE.Material) {
      this.instancedShaft.material.dispose()
    }

    if (this.instancedHead.material instanceof THREE.Material) {
      this.instancedHead.material.dispose()
    }

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

export function instancedQuiverGrid(
  scene: THREE.Scene,
  gridSize: number,
  gridStep: number,
  vectorField: (x: number, y: number) => THREE.Vector3,
  arrowScale = 1,
  arrowColor = 0x5dade2,
): InstancedArrow {
  // Calculate total number of points in the grid
  const pointsPerSide = Math.floor((gridSize * 2) / gridStep) + 1
  const totalPoints = pointsPerSide * pointsPerSide

  // Create instanced arrow helper
  const quiver = new InstancedArrow(
    totalPoints,
    arrowColor,
    0.04, // shaft radius
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
