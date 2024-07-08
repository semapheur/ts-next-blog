import type { NextApiRequest, NextApiResponse } from "next"

import { XorFilter } from "bloom-filters"

import tokenize from "lib/utils/tokenize"
import notes from "content/cache/notes.json"

export type SearchResult = {
  score: number
  slug: string
  title: string
}[]

export type NoteXor = {
  slug: string
  title: string
  filter: {
    type: string
    _filter: string[]
    _bits: number
    _size: number
    _blockLength: number
    _seed: number
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult>,
) {
  const query = tokenize(req.query.q!.toString())

  let result: SearchResult = []
  let score = 0
  for (const note of notes) {
    score = query.filter((q) => note.title.toLowerCase().includes(q)).length

    const xor8 = XorFilter.fromJSON(
      JSON.parse(JSON.stringify(note.filter)),
    ) as XorFilter
    query.forEach((q) => {
      if (xor8.has(q)) score++
    })

    if (score > 0) {
      result.push({
        score: score,
        slug: note.slug,
        title: note.title,
      })
    }
  }
  // Sort search result
  if (result.length) {
    result = result.sort((a, b) => b.score - a.score)
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.json(result)
}
