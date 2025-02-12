import * as THREE from "three"

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
