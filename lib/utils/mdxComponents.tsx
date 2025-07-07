import ChessFigure from "lib/components/ChessFigure"
import Codeblock from "lib/components/Codeblock"
import Figure from "lib/components/Figure"
import GraphFigure from "lib/components/GraphFigure"
import LatexFigure from "lib/components/LatexFigure"
import MathBox from "lib/components/MathBox"
import MathTooltip from "lib/components/MathTooltip"
import TableFigure from "lib/components/TableFigure"
import TikzFigure from "lib/components/TikzFigure"
import type { MDXComponents } from "mdx/types"
import Image, { type ImageProps } from "next/image"

export const mdxComponents: MDXComponents = {
  img: (props) => <Image {...(props as ImageProps)} loading="lazy" />,
  pre: Codeblock,
  ChessFigure,
  Figure,
  GraphFigure,
  LatexFigure,
  MathBox,
  MathTooltip,
  TableFigure,
  TikzFigure,
}
