import Markdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"

interface Props {
  mathString: string
}

export default function MathText({ mathString }: Props) {
  return (
    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {mathString}
    </Markdown>
  )
}
