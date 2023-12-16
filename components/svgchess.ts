import { setAttributes, addChildElement } from 'utils/svg'
import Chess from 'utils/chess'

type Checker = {
  dark: string,
  light: string,
}

function squareToCoord(square: string | number): [number, number] | null {
  
  if (typeof square === 'number') {
    const x = square % 8
    const y = Math.floor(square / 8)
    return [x, y]
  }
  // Square is string
  if (square.length !== 2) return null

  const file = square.match(/^[a-h]/i)?.[0]
  if (!file) return null

  const rank = square.match(/[1-8]$/)?.[0]
  if (!rank) return null

  const x = parseInt(file, 36) - 10
  const y = 8 - parseInt(rank)

  return [x, y]
}

function king(transform: string, color: 'b' | 'w'): SVGGElement {
  const king = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  const attr = {
    width: '45', height: '45', transform: transform,
    fill: color === 'w' ? '#fff' : '#000', 'fill-rule': 'evenodd',
    stroke: color === 'w' ? '#000' : '#fff', 'stroke-width': '1',
    'stroke-linecap':'round', 'stroke-linejoin': 'round',
  }
  setAttributes(king, attr)

  let path: {[key: string]: string} = {
    stroke: '#000', 
    'stroke-linejoin': 'miter',
    d: 'M22.5,11.63V6M20,8h5'
  }
  addChildElement(king, 'path', path)

  path = {
    'stroke-linecap':'butt', 'stroke-linejoin': 'miter',
    d: 'M22.5,25s4.5-7.5,3-10.5c0,0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5,3,3,10.5,3,10.5'
  }
  addChildElement(king, 'path', path)

  path = {
    d: 'M12.5,37c5.5,3.5,14.5,3.5,20,0v-7s9-4.5,6-10.5c-4-6.5-13.5-3.5-16,4V27v-3.5c-2.5-7.5-12-10.5-16-4-3,6,6,10.5,6,10.5v7'
  }
  addChildElement(king, 'path', path)

  path = {
    d: 'M12.5,30c5.5-3,14.5-3,20,0m-20,3.5c5.5-3,14.5-3,20,0m-20 3.5c5.5-3,14.5-3,20,0'
  }
  addChildElement(king, 'path', path)

  return king;
}

function queen(transform: string, color: 'b' | 'w'): SVGGElement {
  const queen = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const attr = {
    width: '45', height: '45', transform: transform,
    fill: color === 'w' ? '#fff' : '#000',
    stroke: color === 'w' ? '#000' : '#fff', 
    'stroke-width': '1',
    'stroke-linejoin': 'round',
  }
  setAttributes(queen, attr)

  let path: {[key: string]: string} = {
    d: 'M9,26C17.5,24.5,30,24.5,36,26L38.5,13.5L31,25L30.7,10.9L25.5,24.5L22.5,10L19.5,24.5L14.3,10.9L14,25L6.5,13.5L9,26z'
  }
  addChildElement(queen, 'path', path)

  path = {
    d: 'M9,26C9,28,10.5,28,11.5,30C12.5,31.5,12.5,31,12,33.5C10.5,34.5,11,36,11,36C9.5,37.5,11,38.5,11,38.5C17.5,39.5,27.5,39.5,34,38.5C34,38.5,35.5,37.5,34,36C34,36,34.5,34.5,33,33.5C32.5,31,32.5,31.5,33.5,30C34.5,28,36,28,36,26C27.5,24.5,17.5,24.5,9,26z'
  }
  addChildElement(queen, 'path', path)

  path = {
    fill: 'none',
    d: 'M11.5,30C15,29,30,2933.5,30'
  }
  addChildElement(queen, 'path', path)

  path = {
    fill: 'none',
    d: 'M12,33.5C18,32.5,27,32.5,33,33.5'
  }
  addChildElement(queen, 'path', path)

  const circle: {[key: string]: string} = {
    cx:'6', cy:'12', r:'2'
  }
  addChildElement(queen, 'circle', circle)

  circle.cx = '14'
  circle.cy = '9'
  addChildElement(queen, 'circle', circle)

  circle.cx = '22.5'
  circle.cy = '8'
  addChildElement(queen, 'circle', circle)

  circle.cx = '31'
  circle.cy = '9'
  addChildElement(queen, 'circle', circle)

  circle.cx = '39'
  circle.cy = '12'
  addChildElement(queen, 'circle', circle)

  return queen;
}

function rook(transform: string, color: 'b' | 'w'): SVGGElement {
  const rook = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const attr = {
    width: '45', height: '45', transform: transform,
    fill: color === 'w' ? '#fff' : '#000',
    'fill-rule': 'evenodd',
    stroke: color === 'w' ? '#000' : '#fff', 
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-miterlimit': '4'
  }
  setAttributes(rook, attr)

  let path: {[key: string]: string} = {
    'stroke-linecap': 'butt',
    d: 'M9,39L36,39L36,36L9,36L9,39z'
  }
  addChildElement(rook, 'path', path)

  path = {
    'stroke-linecap': 'butt',
    d: 'M12,36L12,32L33,32L33,36L12,36z'
  }
  addChildElement(rook, 'path', path)

  path = {
    'stroke-linecap': 'butt',
    d: 'M11,14L11,9L15,9L15,11L20,11L20,9L25,9L25,11L30,11L30,9L34,9L34,14'
  }
  addChildElement(rook, 'path', path)

  path = {
    d: 'M34,14L31,17L14,17L11,14'
  }
  addChildElement(rook, 'path', path)

  path = {
    'stroke-linecap': 'butt',
    'stroke-linejoin': 'miter',
    d: 'M31,17L31,29.5L14,29.5L14,17'
  }
  addChildElement(rook, 'path', path)

  path = {
    d: 'M31,29.5L32.5,32L12.5,32L14,29.5'
  }
  addChildElement(rook, 'path', path)

  path = {
    d: 'M31,29.5L32.5,32L12.5,32L14,29.5'
  }
  addChildElement(rook, 'path', path)

  path = {
    fill: 'none',
    'stroke-linejoin': 'miter',
    d: 'M11,14L34,14'
  }
  addChildElement(rook, 'path', path)

  return rook;
}

function bishop(transform: string, color: 'b' | 'w'): SVGGElement {
  const bishop = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const attr = {
    width: '45', height: '45', transform: transform,
    fill: color === 'w' ? '#fff' : '#000',
    'fill-rule': 'evenodd',
    stroke: color === 'w' ? '#000' : '#fff',
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-miterlimit': '4'
  }
  setAttributes(bishop, attr)

  let path: {[key: string]: string} = {
    'stroke-linecap': 'butt',
    d: 'M9,36C12.39,35.03,19.11,36.43,22.5,34C25.89,36.43,32.61,35.03,36,36C36,36,37.65,36.54,39,38C38.32,38.97,37.35,38.99,36,38.5C32.61,37.53,25.89,38.96,22.5,37.5C19.11,38.96,12.39,37.53,9,38.5C7.65,38.99,6.68,38.97,6,38C7.35,36.54,9,36,9,36z'
  }
  addChildElement(bishop, 'path', path)

  path = {
    'stroke-linecap': 'butt',
    d: 'M15,32C17.5,34.5,27.5,34.5,30,32C30.5,30.5,30,30,30,30C30,27.5,27.5,26,27.5,26C33,24.5,33.5,14.5,22.5,10.5C11.5,14.5,12,24.5,17.5,26C17.5,26,15,27.5,15,30C15,30,14.5,30.5,15,32z'
  }
  addChildElement(bishop, 'path', path)

  path = {
    'stroke-linecap': 'butt',
    d: 'M25,8A2.5,2.5,0,1,1,20,8A2.5,2.5,0,1,1,25,8z'
  }
  addChildElement(bishop, 'path', path)

  path = {
    fill: 'none',
    'stroke-linejoin': 'miter',
    d: 'M17.5,26L27.5,26M15,30L30,30M22.5,15.5L22.5,20.5M20,18L25,18'
  }
  addChildElement(bishop, 'path', path)

  return bishop;
}

function knight(transform: string, color: 'b' | 'w'): SVGGElement {
  const knight = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const attr = {
    width: '45', height: '45', transform: transform,
    fill: color === 'w' ? '#fff' : '#000',
    'fill-rule': 'evenodd',
    stroke: color === 'w' ? '#000' : '#fff',
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-miterlimit': '4'
  }
  setAttributes(knight, attr)

  let path: {[key: string]: string} = {
    d: 'M22,10C32.5,11,38.5,18,38,39L15,39C15,30,25,32.5,23,18'
  }
  addChildElement(knight, 'path', path)

  path = {
    d: 'M24,18C24.38,20.91,18.45,25.37,16,27C13,29,13.18,31.34,11,31C9.958,30.06,12.41,27.96,11,28C10,28,11.19,29.23,10,30C9,30,5.997,31,6,26C6,24,12,14,12,14C12,14,13.89,12.1,14,10.5C13.27,9.506,13.5,8.5,13.5,7.5C14.5,6.5,16.5,10,16.5,10L18.5,10C18.5,10,19.28,8.008,21,7C22,7,22,10,22,10'
  }
  addChildElement(knight, 'path', path)

  path = {
    d: 'M9.5,25.5A0.5,0.5,0,1,1,8.5,25.5A0.5,0.5,0,1,1,9.5,25.5z'
  }
  addChildElement(knight, 'path', path)

  path = {
    fill: 'none',
    stroke: color === 'w' ? '#000' : '#fff',
    'stroke-linejoin': 'miter',
    transform: 'matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)',
    d: 'M15,15.5A0.5,1.5,0,1,1,14,15.5A0.5,1.5,0,1,1,15,15.5z'
  }
  addChildElement(knight, 'path', path)

  return knight;
}

function pawn(transform: string, color: 'b' | 'w'): SVGGElement {
  const pawn = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const attr = {
    width: '45', height: '45', transform: transform,
    fill: color === 'w' ? '#fff' : '#000',
    'fill-rule': 'nonzero',
    stroke: color === 'w' ? '#000' : '#fff',
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'miter',
    'stroke-miterlimit': '4'
  }
  setAttributes(pawn, attr)

  const path: {[key: string]: string} = {
    d: 'm22.5,9c-2.21,0,-4,1.79,-4,4,0,0.89,0.29,1.71,0.78,2.38C17.33,16.5,16,18.59,16,21c0,2.03,0.94,3.84,2.41,5.03C15.41,27.09,11,31.58,11,39.5H34C34,31.58,29.59,27.09,26.59,26.03,28.06,24.84,29,23.03,29,21,29,18.59,27.67,16.5,25.72,15.38,26.21,14.71,26.5,13.89,26.5,13c0,-2.21,-1.79,-4,-4,-4z'
  }
  addChildElement(pawn, 'path', path)

  return pawn;
}

function drawPiece(piece: string, transform: string) {
  let color: 'b' | 'w' = 'b'
  if (piece === piece.toUpperCase()) color = 'w'

  switch (piece.toLowerCase()) {
    case 'p': {
      return pawn(transform, color);
    }
    case 'n': {
      return knight(transform, color);
    }
    case 'b': {
      return bishop(transform, color);
    }
    case 'r': {
      return rook(transform, color);
    }
    case 'q': {
      return queen(transform, color);
    }
    case 'k': {
      return king(transform, color);
    }
    default: {
      throw Error(`Invalid piece code: ${piece}`)
    }
  }
}

export class SVGChess {
  private xmlns = 'http://www.w3.org/2000/svg'
  private svgElement: SVGSVGElement
  private svgDefs: SVGDefsElement
  private engine = new Chess()

  constructor(container: HTMLDivElement, size?: number, colors?: Checker) {
    
    // Get SVG dimensions from container if not provided
    const rect = container.getBoundingClientRect()
    if (!size) size = rect.width

    if (!colors) colors = {dark: '#d18b47', light: '#ffce9e'}
    
    this.svgElement = document.createElementNS(this.xmlns, 'svg') as SVGSVGElement
    const svgAttr = {
      xmlns: this.xmlns,
      width: size.toString(),
      height: size.toString(),
      viewBox: '0 0 8 8',
    }
    setAttributes(this.svgElement, svgAttr)
    container.appendChild(this.svgElement)

    // Create defs element
    this.svgDefs = document.createElementNS(this.xmlns, 'defs') as SVGDefsElement
    this.svgElement.appendChild(this.svgDefs)

    // Checker Pattern
    const attr = {
      id: 'checker-pattern', width: '2', height: '2',
      patternUnits: 'userSpaceOnUse',
    }
    const pattern = document.createElementNS(this.xmlns, 'pattern')
    setAttributes(pattern, attr)

    for (const x of [0, 1]) {
      for (const y of [0, 1]) {
        const checker = {
          class: 'checker',
          x: x.toString(), y: y.toString(), 
          width: '1', height: '1',
          fill: (x + y) % 2 === 0 ? colors.light : colors.dark
        }
        addChildElement(pattern, 'rect', checker)
      }
    }
    this.svgDefs.appendChild(pattern)

    // Chess board
    addChildElement(this.svgElement, 'g', {id: 'board-group'})
    const boardGroup = document.getElementById('board-group')
    if (!boardGroup) return
    const boardRect = {x: '0', y: '0', width: '8', height: '8',
      fill: 'url(#checker-pattern)'
    }
    addChildElement(boardGroup, 'rect', boardRect)

    // Pieces
    addChildElement(this.svgElement, 'g', {id: 'pieces-group'})
  }

  public placePiece(piece: string, square: string | number) {
    const scale = (1/45).toString()
    const coord = squareToCoord(square)
    if (!coord) return
    const transform = `translate(${coord[0]},${coord[1]}) scale(${scale}) `

    const element = drawPiece(piece, transform)
    const pieces = document.getElementById('pieces-group')
    if (!pieces) return
    pieces.appendChild(element)
  }

  public boardPosition(fen: string) {
    this.engine.loadFEN(fen)
    const pieces = this.engine.getPieceMap()
    console.log(pieces)
    for (const [square, piece] of pieces) {
      this.placePiece(piece, square)
    }
  }

}