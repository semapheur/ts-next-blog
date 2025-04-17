export function wavelengthToColor(wavelength: number, hex = false) {
  const gamma = 0.8
  const intensityMax = 255
  let factor: number
  let R: number
  let G: number
  let B: number

  if (wavelength >= 380 && wavelength < 440) {
    R = -(wavelength - 440) / (440 - 380)
    G = 0.0
    B = 1.0
  } else if (wavelength >= 440 && wavelength < 490) {
    R = 0.0
    G = (wavelength - 440) / (490 - 440)
    B = 1.0
  } else if (wavelength >= 490 && wavelength < 510) {
    R = 0.0
    G = 1.0
    B = -(wavelength - 510) / (510 - 490)
  } else if (wavelength >= 510 && wavelength < 580) {
    R = (wavelength - 510) / (580 - 510)
    G = 1.0
    B = 0.0
  } else if (wavelength >= 580 && wavelength < 645) {
    R = 1.0
    G = -(wavelength - 645) / (645 - 580)
    B = 0.0
  } else if (wavelength >= 645 && wavelength <= 780) {
    R = 1.0
    G = 0.0
    B = 0.0
  } else {
    R = 0.0
    G = 0.0
    B = 0.0
  }

  // Adjust intensity
  if (wavelength >= 380 && wavelength < 645) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (645 - 380)
  } else {
    factor = 1.0
  }

  // Apply gamma correction
  R = Math.round(intensityMax * (R * factor) ** gamma)
  G = Math.round(intensityMax * (G * factor) ** gamma)
  B = Math.round(intensityMax * (B * factor) ** gamma)

  if (hex) return rgbToHex(R, G, B)

  return [R, G, B]
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}
