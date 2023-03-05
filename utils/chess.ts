// KhepriChess

export enum Square {
  a8, b8, c8, d8, e8, f8, g8, h8,
  a7, b7, c7, d7, e7, f7, g7, h7,
  a6, b6, c6, d6, e6, f6, g6, h6,
  a5, b5, c5, d5, e5, f5, g5, h5,
  a4, b4, c4, d4, e4, f4, g4, h4,
  a3, b3, c3, d3, e3, f3, g3, h3,
  a2, b2, c2, d2, e2, f2, g2, h2,
  a1, b1, c1, d1, e1, f1, g1, h1, o,
}

export enum Pieces {
  Pawn, Knight, Bishop, Rook, Queen, King
}

export enum Color {
  White, Black
}

export type Piece = {
  type: Pieces,
  color: Color
}

type BoardPosition = {
  pieces: bigint[][],
  occupancies: [bigint, bigint],
  squares: Piece[],
}

function prettyPrintPiece(piece: Piece) {
  let pretty = Pieces[piece.type]
  if (pretty === 'Knight') {
    pretty = 'N'
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
    0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n,
    8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n,
    16n, 17n, 18n, 19n, 20n, 21n, 22n, 23n,
    24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n,
    32n, 33n, 34n, 35n, 36n, 37n, 38n, 39n,
    40n, 41n, 42n, 43n, 44n, 45n, 46n, 47n,
    48n, 49n, 50n, 51n, 52n, 53n, 54n, 55n,
    56n, 57n, 58n, 59n, 60n, 61n, 62n, 63n, 64n,
  ]

  private readonly CharToPiece = new Map<string, Piece>([
    ['P', { type: Pieces.Pawn, color: Color.White }],
    ['N', { type: Pieces.Knight, color: Color.White }],
    ['B', { type: Pieces.Bishop, color: Color.White }],
    ['R', { type: Pieces.Rook, color: Color.White }],
    ['Q', { type: Pieces.Queen, color: Color.White }],
    ['K', { type: Pieces.King, color: Color.White }],
    ['p', { type: Pieces.Pawn, color: Color.Black }],
    ['n', { type: Pieces.Knight, color: Color.Black }],
    ['b', { type: Pieces.Bishop, color: Color.Black }],
    ['r', { type: Pieces.Rook, color: Color.Black }],
    ['q', { type: Pieces.Queen, color: Color.Black }],
    ['k', { type: Pieces.King, color: Color.Black }]
  ])

  private readonly board: BoardPosition = {
    pieces: [],
    occupancies: [0n, 0n],
    squares: [],
  }

  private setBit(board: bigint, square: Square) {
    return board |= 1n << this.SquareBigInt[square]
  }

  private getBit(board: bigint, square: Square) {
    return board & (1n << this.SquareBigInt[square])
  }

  private removeBit(board: bigint, square: Square) {
    return board &= ~(1n << this.SquareBigInt[square])
  }

  public loadFEN(fen: string) {
    this.board.pieces = [
      [0n, 0n, 0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n, 0n, 0n],
    ]

    const pieces = fen.split(' ')[0].split('')

    let square = 0;
    for (let i = 0; i < pieces.length; i++) {
      const char = pieces[i];

      switch (char.toLowerCase()) {
        case 'p': case 'n': case 'b': case 'r': case 'q': case 'k': {
          const piece = this.CharToPiece.get(char)!
          this.placePiece(piece.type, piece.color, square);
          square++
          break
        }
        case '1': case '2': case '3': case '4':
        case '4': case '5': case '6': case '7': case '8': {
          square += parseInt(char)
          break;
        }
        case '/': {
          break;
        }
        default: {
          throw new Error(`Unable to parse FEN character: ${char}`)
        }
      }
    }
  }

  public placePiece(piece: Pieces, color: Color, square: Square) {
    this.board.pieces[color][piece] = this.setBit(this.board.pieces[color][piece], square)
    this.board.occupancies[color] = this.setBit(this.board.occupancies[color], square)
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