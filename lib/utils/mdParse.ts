import type { NoteHeading } from "lib/utils/types"

function nest<T extends object>(arr: T[], ix: number[], value: T): void {
  for (const i of ix) {
    const obj = arr[i - 1]
    if (!("children" in obj)) obj["children"] = []
    arr = obj["children"]
  }
  arr.push(value)
}

export async function markdownHeadings(source: string) {
  const headings = source.split("\n").filter((line) => {
    return line.match(/^#+\s/)
  })

  const slugs: { [key: string]: number } = {}
  const counter = Array(6).fill(0)

  const result: NoteHeading[] = []

  for (const h of headings) {
    const text: string = h.replace(/^#+\s/, "").replace(/\r|\n/g, "").trim()
    let slug = text
      .toLowerCase()
      .replace(/[\\${}()/,']|/g, "")
      .replaceAll(" ", "-")

    // Add suffix to duplicate slugs
    if (slug in slugs) {
      slug += `-${++slugs[slug]}`
    } else {
      slugs[slug] = 0
    }
    const level = h.match(/^#+/)![0].length

    // Update counter
    counter[level - 1]++
    counter.fill(0, level)

    let number = `${counter[0]}`

    let i = 2
    while (i <= level) {
      number += `.${counter[i - 1]}`
      i++
    }
    const obj = {
      text: text,
      slug: slug,
      level: level,
    }

    if (level === 1) {
      result.push(obj)
    } else {
      const keys = number.split(".").map(Number).slice(0, -1)
      nest(result, keys, obj)
    }
  }
  return result
}
