import * as fs from "node:fs"

function findMismatchedInlineMath(mdxFile: string) {
  const mdxContent = fs.readFileSync(mdxFile, "utf8")

  // Split the content into lines
  const lines = mdxContent.split("\n")

  let inMath = false
  let lastOpenLine = -1
  let lastOpenCol = -1

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]

    // Skip double dollar expressions
    if (line.includes("$$")) continue

    for (let colNum = 0; colNum < line.length; colNum++) {
      if (line[colNum] === "$") {
        if (inMath) {
          inMath = false
        } else {
          inMath = true
          lastOpenLine = lineNum
          lastOpenCol = colNum
        }
      }
    }

    // Check if we're still in math mode at the end of the line
    if (inMath && lineNum !== lastOpenLine) {
      return {
        message: "Unclosed inline math expression",
        line: lastOpenLine + 1,
        column: lastOpenCol + 1,
      }
    }
  }

  // Check if we're still in math mode at the end of the file
  if (inMath) {
    return {
      message: "Unclosed inline math expression",
      line: lastOpenLine + 1,
      column: lastOpenCol + 1,
    }
  }

  return { message: "No mismatched inline math delimiters found" }
}

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

console.log(
  findMismatchedInlineMath("./content/notes/math/affine_geometry.mdx"),
)
//relabelLatexEquations("./content/notes/math/differential_geometry.mdx")
