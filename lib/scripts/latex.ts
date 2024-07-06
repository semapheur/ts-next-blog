import * as fs from "node:fs"

function relabelLatexEquations(mdxFile: string) {
  let mdxContent = fs.readFileSync(mdxFile, "utf8")

  const labelRegex = /\\label\{equation-\d+\}/g

  const equationLabels = mdxContent.match(labelRegex)
  if (!equationLabels) return

  const labels: number[] = []
  for (let i = 0; i < equationLabels.length; i++) {
    const equationNumber = equationLabels[i].match(/\d+/)
    if (!equationNumber) continue

    labels.push(Number.parseInt(equationNumber[0]))
  }

  let labelCounter = 1
  mdxContent = mdxContent.replace(labelRegex, (match: string) => {
    return `\\label{equation-${labelCounter++}}`
  })

  for (let i = labels.length - 1; i >= 0; i--) {
    mdxContent = mdxContent.replace(
      new RegExp(String.raw`\\eqref{equation-${labels[i]}}`, "g"),
      `\\eqref{equation_${i + 1}}`,
    )
  }
  mdxContent = mdxContent.replace(
    /\\eqref{equation_(\d+)}/g,
    (match: string, p1: string) => {
      return `\\eqref{equation-${p1}}`
    },
  )

  fs.writeFile(mdxFile, mdxContent, "utf8", (e) => {
    if (e) console.log(e)
  })
}

relabelLatexEquations("./content/notes/math/differential_geometry.mdx")
