import React from "react"
import MathRenderer from "./MathText"

type Props = {
  text: string
}

type TextPart = {
  type: "text" | "math"
  content: string
}

export default function MathParser({ text }: Props) {
  // Helper function to split the string into parts (text and LaTeX)
  const parseTextWithMath = (inputText: string) => {
    const regex = /(\$\$?.*?\$\$?)/g // Matches $...$ or $$...$$
    const parts: TextPart[] = []
    let lastIndex = 0

    // Find matches and split the input string
    inputText.replace(regex, (match, latex: string, index: number) => {
      // Push the text between math parts as regular text
      if (index > lastIndex) {
        parts.push({ type: "text", content: inputText.slice(lastIndex, index) })
      }
      // Push the math part to be rendered
      parts.push({ type: "math", content: latex })
      lastIndex = index + latex.length
      return "" // We don't need to modify the string during replace
    })

    // Push any remaining text after the last math delimiter
    if (lastIndex < inputText.length) {
      parts.push({ type: "text", content: inputText.slice(lastIndex) })
    }

    return parts
  }

  // Parse the string and render accordingly
  const parsedParts = parseTextWithMath(text)

  return (
    <>
      {parsedParts.map((part: TextPart, index: number) => {
        if (part.type === "text") {
          return part.content
        }
        if (part.type === "math") {
          return (
            <MathRenderer
              key={`${part.content}.${index}`}
              mathString={part.content}
            />
          ) // Render LaTeX
        }
        return null
      })}
    </>
  )
}
