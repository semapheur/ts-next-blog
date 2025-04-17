// KhepriChess

export enum Square {
  a8 = 0,
  b8 = 1,
  c8 = 2,
  d8 = 3,
  e8 = 4,
  f8 = 5,
  g8 = 6,
  h8 = 7,
  a7 = 8,
  b7 = 9,
  c7 = 10,
  d7 = 11,
  e7 = 12,
  f7 = 13,
  g7 = 14,
  h7 = 15,
  a6 = 16,
  b6 = 17,
  c6 = 18,
  d6 = 19,
  e6 = 20,
  f6 = 21,
  g6 = 22,
  h6 = 23,
  a5 = 24,
  b5 = 25,
  c5 = 26,
  d5 = 27,
  e5 = 28,
  f5 = 29,
  g5 = 30,
  h5 = 31,
  a4 = 32,
  b4 = 33,
  c4 = 34,
  d4 = 35,
  e4 = 36,
  f4 = 37,
  g4 = 38,
  h4 = 39,
  a3 = 40,
  b3 = 41,
  c3 = 42,
  d3 = 43,
  e3 = 44,
  f3 = 45,
  g3 = 46,
  h3 = 47,
  a2 = 48,
  b2 = 49,
  c2 = 50,
  d2 = 51,
  e2 = 52,
  f2 = 53,
  g2 = 54,
  h2 = 55,
  a1 = 56,
  b1 = 57,
  c1 = 58,
  d1 = 59,
  e1 = 60,
  f1 = 61,
  g1 = 62,
  h1 = 63,
  o = 64,
}

export enum Pieces {
  Pawn = 0,
  Knight = 1,
  Bishop = 2,
  Rook = 3,
  Queen = 4,
  King = 5,
}

export enum Color {
  White = 0,
  Black = 1,
}

export type Piece = {
  type: Pieces
  color: Color
}

type BoardPosition = {
  pieces: bigint[][]
  occupancies: [bigint, bigint]
  squares: Piece[]
}

function prettyPrintPiece(piece: Piece) {
  let pretty = Pieces[piece.type]
  if (pretty === "Knight") {
    pretty = "N"
  } else {
    pretty = pretty[0]
  }

  if (piece.color) {
    pretty = pretty.toLowerCase()
  }
  return pretty
}

export default class Chess {
  constructor() {
    this.initialize()
  }

  private readonly squareBB: bigint[] = []

  private readonly SquareBigInt = [
    0n,
    1n,
    2n,
    3n,
    4n,
    5n,
    6n,
    7n,
    8n,
    9n,
    10n,
    11n,
    12n,
    13n,
    14n,
    15n,
    16n,
    17n,
    18n,
    19n,
    20n,
    21n,
    22n,
    23n,
    24n,
    25n,
    26n,
    27n,
    28n,
    29n,
    30n,
    31n,
    32n,
    33n,
    34n,
    35n,
    36n,
    37n,
    38n,
    39n,
    40n,
    41n,
    42n,
    43n,
    44n,
    45n,
    46n,
    47n,
    48n,
    49n,
    50n,
    51n,
    52n,
    53n,
    54n,
    55n,
    56n,
    57n,
    58n,
    59n,
    60n,
    61n,
    62n,
    63n,
    64n,
  ]

  private readonly CharToPiece = new Map<string, Piece>([
    ["P", { type: Pieces.Pawn, color: Color.White }],
    ["N", { type: Pieces.Knight, color: Color.White }],
    ["B", { type: Pieces.Bishop, color: Color.White }],
    ["R", { type: Pieces.Rook, color: Color.White }],
    ["Q", { type: Pieces.Queen, color: Color.White }],
    ["K", { type: Pieces.King, color: Color.White }],
    ["p", { type: Pieces.Pawn, color: Color.Black }],
    ["n", { type: Pieces.Knight, color: Color.Black }],
    ["b", { type: Pieces.Bishop, color: Color.Black }],
    ["r", { type: Pieces.Rook, color: Color.Black }],
    ["q", { type: Pieces.Queen, color: Color.Black }],
    ["k", { type: Pieces.King, color: Color.Black }],
  ])

  private readonly board: BoardPosition = {
    pieces: [],
    occupancies: [0n, 0n],
    squares: [],
  }

  private setBit(board: bigint, square: Square) {
    board |= 1n << this.SquareBigInt[square]
    return board
  }

  private getBit(board: bigint, square: Square) {
    return board & (1n << this.SquareBigInt[square])
  }

  private removeBit(board: bigint, square: Square) {
    board &= ~(1n << this.SquareBigInt[square])
    return board
  }

  public loadFEN(fen: string) {
    this.board.pieces = [
      [0n, 0n, 0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n, 0n, 0n],
    ]

    const pieces = fen.split(" ")[0].split("")

    let square = 0
    for (let i = 0; i < pieces.length; i++) {
      const char = pieces[i]

      switch (char.toLowerCase()) {
        case "p":
        case "n":
        case "b":
        case "r":
        case "q":
        case "k": {
          const piece = this.CharToPiece.get(char)!
          this.placePiece(piece.type, piece.color, square)
          square++
          break
        }
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8": {
          square += Number.parseInt(char)
          break
        }
        case "/": {
          break
        }
        default: {
          throw new Error(`Unable to parse FEN character: ${char}`)
        }
      }
    }
  }

  public placePiece(piece: Pieces, color: Color, square: Square) {
    this.board.pieces[color][piece] = this.setBit(
      this.board.pieces[color][piece],
      square,
    )
    this.board.occupancies[color] = this.setBit(
      this.board.occupancies[color],
      square,
    )
    this.board.squares[square] = { type: piece, color: color }
  }

  public getPieceMap() {
    const result = new Map<number, string>()

    for (let i = 0; i < this.board.squares.length; i++) {
      if (this.board.squares[i] !== undefined) {
        const piece = prettyPrintPiece(this.board.squares[i])
        result.set(i, piece)
      }
    }
    return result
  }

  private initialize() {
    for (let square = Square.a8; square <= Square.h1; square++) {
      this.squareBB[square] = this.setBit(0n, square)
    }
  }
}
