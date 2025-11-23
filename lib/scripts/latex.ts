import * as fs from "node:fs";
import path from "node:path";

interface LatexCommand {
  command: string;
  line: number;
  column: number;
}

interface LatexIssue {
  message: string;
  line?: number;
  column?: number;
  commands?: LatexCommand[];
}

interface Test {
  line: number;
  message: string;
}

function findUnclosedLatex(mdxFile: string) {
  const mdxContent = fs.readFileSync(mdxFile, "utf8");
  const lines = mdxContent.split("\n");
  let inDisplayMath = false;
  let inCodeBlock = false;
  const unclosedMath: Test[] = [];

  const latexFunctionRegex = /\{(?=[^}]*\S)[^}]*\}/g;
  const inlineMathDelim = /(?<!\\)\$(?!\$)/g;
  const displayMathDelim = /(?<!\\)\$\$(?!\$)/g;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Check for code block start/end
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    // Skip if inside code block
    if (inCodeBlock) continue;

    // Check for display math delimiters
    const displayMathMatches = [...line.matchAll(displayMathDelim)];
    inDisplayMath = displayMathMatches.length % 2 !== 0;
    if (displayMathMatches.length > 1) {
      unclosedMath.push({
        line: lineNum + 1,
        message: "Multiple $$ delimiters found on the same line",
      });
      continue;
    }

    const inlineMathMatches = [...line.matchAll(inlineMathDelim)];
    if (inDisplayMath && inlineMathMatches.length > 0) {
      unclosedMath.push({
        line: lineNum + 1,
        message: "Inline $ found inside display math expression",
      });
      continue;
    }

    if (inDisplayMath) continue;

    if (inlineMathMatches.length % 2 !== 0) {
      unclosedMath.push({
        line: lineNum + 1,
        message: "Unclosed inline math expression",
      });
      continue;
    }

    if (inlineMathMatches.length === 0) {
      const latexFunctionMatches = [...line.matchAll(latexFunctionRegex)];
      for (const match of latexFunctionMatches) {
        unclosedMath.push({
          line: lineNum + 1,
          message: `LaTeX command "${match[0]}" found outside of math mode`,
        });
      }
    }
  }

  if (inDisplayMath) {
    unclosedMath.push({
      line: lines.length,
      message: "Unclosed $$ display math block at end of file",
    });
  }

  return unclosedMath;
}

function findLatexIssues(mdxFile: string): LatexIssue {
  const mdxContent = fs.readFileSync(mdxFile, "utf8");
  const lines = mdxContent.split("\n");
  let inMath = false;
  let inDisplayMath = false;
  let inCodeBlock = false;
  let lastOpenLine = -1;
  let lastOpenCol = -1;
  const latexOutsideMath: { command: string; line: number; column: number }[] =
    [];
  const allIssues: LatexIssue[] = [];

  // More comprehensive regex that matches backslash followed by letter(s)
  const latexCommandRegex = /\\[a-zA-Z]+(?![a-zA-Z])/g;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Check for code block start/end
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip processing if we're inside a code block
    if (inCodeBlock) continue;

    // Handle display math blocks
    if (line.includes("$$")) {
      const matches = line.match(/\$\$/g) || [];
      for (let i = 0; i < matches.length; i++) {
        inDisplayMath = !inDisplayMath;
      }
      continue;
    }

    if (inDisplayMath) continue;

    // Build a map of which positions are inside math mode for this line
    const mathRanges: Array<{ start: number; end: number }> = [];
    let tempPos = 0;
    let tempInMath = false;
    let mathStart = -1;

    while (tempPos < line.length) {
      // Handle escaped dollar signs
      if (
        line[tempPos] === "\\" &&
        tempPos + 1 < line.length &&
        line[tempPos + 1] === "$"
      ) {
        tempPos += 2;
        continue;
      }

      // Handle math mode transitions
      if (line[tempPos] === "$") {
        // Check if it's not escaped
        let backslashCount = 0;
        let checkPos = tempPos - 1;
        while (checkPos >= 0 && line[checkPos] === "\\") {
          backslashCount++;
          checkPos--;
        }

        if (backslashCount % 2 === 0) {
          if (tempInMath) {
            // Closing math mode
            mathRanges.push({ start: mathStart, end: tempPos });
            tempInMath = false;
          } else {
            // Opening math mode
            tempInMath = true;
            mathStart = tempPos;
          }
        }
      }
      tempPos++;
    }

    // Now check for LaTeX commands outside the math ranges
    latexCommandRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = latexCommandRegex.exec(line)) !== null) {
      const matchPos = match.index;

      // Check if this position is inside any math range
      let isInMath = false;
      for (const range of mathRanges) {
        if (matchPos > range.start && matchPos < range.end) {
          isInMath = true;
          break;
        }
      }

      // Also check if we're in math mode from a previous line
      if (!isInMath && !inMath) {
        latexOutsideMath.push({
          command: match[0],
          line: lineNum + 1,
          column: match.index + 1,
        });
      }
    }

    // Update global math mode state for multi-line tracking
    let pos = 0;
    while (pos < line.length) {
      // Handle escaped dollar signs
      if (
        line[pos] === "\\" &&
        pos + 1 < line.length &&
        line[pos + 1] === "$"
      ) {
        pos += 2;
        continue;
      }

      // Handle math mode transitions
      if (line[pos] === "$") {
        // Check if it's not escaped
        let backslashCount = 0;
        let checkPos = pos - 1;
        while (checkPos >= 0 && line[checkPos] === "\\") {
          backslashCount++;
          checkPos--;
        }

        if (backslashCount % 2 === 0) {
          if (inMath) {
            inMath = false;
          } else {
            inMath = true;
            lastOpenLine = lineNum;
            lastOpenCol = pos;
          }
        }
      }
      pos++;
    }

    // Check for unclosed math mode at end of line
    if (inMath && lineNum !== lastOpenLine) {
      allIssues.push({
        message: "Unclosed inline math expression",
        line: lastOpenLine + 1,
        column: lastOpenCol + 1,
      });
      // Reset to allow checking rest of document independently
      inMath = false;
      lastOpenLine = -1;
      lastOpenCol = -1;
    }
  }

  // Check for unclosed math mode at end of file
  if (inMath) {
    allIssues.push({
      message: "Unclosed inline math expression",
      line: lastOpenLine + 1,
      column: lastOpenCol + 1,
    });
  }

  if (inDisplayMath) {
    allIssues.push({
      message: "Unclosed display math expression",
      line: lines.length,
      column: 1,
    });
  }

  // Check for unclosed code block at end of file
  if (inCodeBlock) {
    allIssues.push({
      message: "Unclosed code block",
      line: lines.length,
      column: 1,
    });
  }

  // Add LaTeX outside math issues
  if (latexOutsideMath.length > 0) {
    allIssues.push({
      message: "Found LaTeX commands outside of math mode",
      commands: latexOutsideMath,
    });
  }

  // Return the first issue found, or no issues
  if (allIssues.length > 0) {
    return allIssues[0];
  }

  return { message: "No issues found" };
}

interface NoteLatexIssues {
  [slug: string]: LatexIssue;
}

async function checkNotesForIssues() {
  const result = {} as NoteLatexIssues;

  console.log("Checking notes for LaTeX issues...");
  const notesDir = path.join(process.cwd(), "content", "notes");
  for (const subject of fs.readdirSync(notesDir)) {
    const subjectDir = path.join(notesDir, subject);

    for (const fileName of fs.readdirSync(subjectDir)) {
      const latexIssues = findLatexIssues(path.join(subjectDir, fileName));
      if (latexIssues.message !== "No issues found") {
        const slug = `${subject}/${fileName.replace(".mdx", "")}`;
        result[slug] = latexIssues;
      }
    }
  }
  return result;
}

function relabelLatexEquations(mdxFile: string) {
  let mdxContent = fs.readFileSync(mdxFile, "utf8");

  const labelRegex = /\\label\{equation-\d+\}/g;

  const equationLabels = mdxContent.match(labelRegex);
  if (!equationLabels) return;

  const labels: number[] = [];
  for (let i = 0; i < equationLabels.length; i++) {
    const equationNumber = equationLabels[i].match(/\d+/);
    if (!equationNumber) continue;

    labels.push(Number.parseInt(equationNumber[0]));
  }

  let labelCounter = 1;
  mdxContent = mdxContent.replace(labelRegex, (match: string) => {
    return `\\label{equation-${labelCounter++}}`;
  });

  for (let i = labels.length - 1; i >= 0; i--) {
    mdxContent = mdxContent.replace(
      new RegExp(String.raw`\\eqref{equation-${labels[i]}}`, "g"),
      `\\eqref{equation_${i + 1}}`,
    );
  }
  mdxContent = mdxContent.replace(
    /\\eqref{equation_(\d+)}/g,
    (match: string, p1: string) => {
      return `\\eqref{equation-${p1}}`;
    },
  );

  fs.writeFile(mdxFile, mdxContent, "utf8", (e) => {
    if (e) console.log(e);
  });
}
//console.log(findLatexIssues("./content/notes/physics/quantum_mechanics.mdx"))
console.log(
  findLatexIssues(
    "./content/notes/physics/quantum_mechanics/hilbert_space_formulation.mdx",
  ),
);
//relabelLatexEquations("./content/notes/math/differential_geometry.mdx")
//;(async () => {
//  const issues = await checkNotesForIssues()
//  if (Object.keys(issues).length === 0) {
//    console.log("No LaTeX issues found in any notes.")
//  } else {
//    console.log("LaTeX issues found in the following notes:")
//    console.log(JSON.stringify(issues, null, 2))
//  }
//})()
