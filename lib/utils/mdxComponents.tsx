import Image, { type ImageProps } from "next/image"
import type { MDXComponents } from "mdx/types"

import ChessFigure from "lib/components/ChessFigure"
import Codeblock from "lib/components/Codeblock"
import Figure from "lib/components/Figure"
import GraphFigure from "lib/components/GraphFigure"
import LatexFigure from "lib/components/LatexFigure"
import MathBox from "lib/components/MathBox"
import MathTooltip from "lib/components/MathTooltip"
import TikzFigure from "lib/components/TikzFigure"

export const mdxComponents: MDXComponents = {
  img: (props) => <Image {...(props as ImageProps)} loading="lazy" />,
  pre: Codeblock,
  ChessFigure,
  Figure,
  GraphFigure,
  LatexFigure,
  MathBox,
  MathTooltip,
  TikzFigure,
}
