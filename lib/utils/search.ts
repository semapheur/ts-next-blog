import { XorFilter } from "bloom-filters"

import type { SearchResult, NoteXor } from "pages/api/searchnotes"
import tokenize from "lib/utils/tokenize"

export function searchNotes(query: string, notes: NoteXor[]): SearchResult {
  const result: SearchResult = []
  const tokens = tokenize(query)

  let score = 0
  for (const note of notes) {
    score = tokens.filter((q) => note.title.toLowerCase().includes(q)).length

    const xor8 = XorFilter.fromJSON(
      JSON.parse(JSON.stringify(note.filter)),
    ) as XorFilter
    tokens.forEach((q) => {
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
  return result
}
