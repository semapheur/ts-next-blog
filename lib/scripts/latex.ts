import * as fs from "node:fs"

function findLatexIssues(mdxFile: string) {
  const mdxContent = fs.readFileSync(mdxFile, "utf8")
  const lines = mdxContent.split("\n")

  let inMath = false
  let inDisplayMath = false
  let inCodeBlock = false
  let lastOpenLine = -1
  let lastOpenCol = -1
  const latexOutsideMath: { command: string; line: number; column: number }[] =
    []

  // Regular expression for common LaTeX commands
  const latexCommandRegex = /\\[a-zA-Z]+(?:\{[^}]*\})*|\\\[|\\\]|\\\(|\\\)/g

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]

    // Check for code block start/end
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // Skip processing if we're inside a code block
    if (inCodeBlock) continue

    // Handle display math blocks
    if (line.includes("$$")) {
      const matches = line.match(/\$\$/g) || []
      for (let i = 0; i < matches.length; i++) {
        inDisplayMath = !inDisplayMath
      }
      continue
    }

    if (inDisplayMath) continue

    // Track inline math mode and find LaTeX commands
    let pos = 0
    while (pos < line.length) {
      // Handle escaped dollar signs
      if (
        line[pos] === "\\" &&
        pos + 1 < line.length &&
        line[pos + 1] === "$"
      ) {
        pos += 2
        continue
      }

      // Handle math mode transitions
      if (line[pos] === "$") {
        // Check if it's not escaped
        let backslashCount = 0
        let checkPos = pos - 1
        while (checkPos >= 0 && line[checkPos] === "\\") {
          backslashCount++
          checkPos--
        }

        if (backslashCount % 2 === 0) {
          if (inMath) {
            inMath = false
          } else {
            inMath = true
            lastOpenLine = lineNum
            lastOpenCol = pos
          }
        }
      }
      pos++
    }

    // Check for LaTeX commands outside math mode
    if (!inMath && !inDisplayMath) {
      // Reset the regex state for each new line
      latexCommandRegex.lastIndex = 0
      let match: RegExpExecArray | null = latexCommandRegex.exec(line)
      while (match !== null) {
        // Verify this isn't inside an inline math block
        let dollarCount = 0
        for (let i = 0; i < match.index; i++) {
          if (line[i] === "$") {
            // Check if it's not escaped
            let backslashCount = 0
            let checkPos = i - 1
            while (checkPos >= 0 && line[checkPos] === "\\") {
              backslashCount++
              checkPos--
            }
            if (backslashCount % 2 === 0) {
              dollarCount++
            }
          }
        }
        if (dollarCount % 2 === 0) {
          // Even number of $ means we're outside math mode
          latexOutsideMath.push({
            command: match[0],
            line: lineNum + 1,
            column: match.index + 1,
          })
        }
        match = latexCommandRegex.exec(line)
      }
    }

    // Check for unclosed math mode at end of line
    if (inMath && lineNum !== lastOpenLine) {
      return {
        message: "Unclosed inline math expression",
        line: lastOpenLine + 1,
        column: lastOpenCol + 1,
      }
    }
  }

  // Check for unclosed math mode at end of file
  if (inMath) {
    return {
      message: "Unclosed inline math expression",
      line: lastOpenLine + 1,
      column: lastOpenCol + 1,
    }
  }

  if (inDisplayMath) {
    return {
      message: "Unclosed display math expression",
      line: lines.length,
      column: 1,
    }
  }

  // Check for unclosed code block at end of file
  if (inCodeBlock) {
    return {
      message: "Unclosed code block",
      line: lines.length,
      column: 1,
    }
  }

  // Return results
  if (latexOutsideMath.length > 0) {
    return {
      message: "Found LaTeX commands outside of math mode",
      commands: latexOutsideMath,
    }
  }

  return { message: "No issues found" }
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

console.log(findLatexIssues("./content/notes/physics/quantum_formalism.mdx"))
//relabelLatexEquations("./content/notes/math/differential_geometry.mdx")
