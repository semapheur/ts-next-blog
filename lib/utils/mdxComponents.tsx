import Image, { type ImageProps } from 'next/image'
import type { MDXComponents } from 'mdx/types'

import ChessFig from 'lib/components/ChessFig'
import Codeblock from 'lib/components/Codeblock'
import LatexFig from 'lib/components/LatexFig'
import MathBox from 'lib/components/MathBox'
import MathTooltip from 'lib/components/MathTooltip'

export const mdxComponents: MDXComponents = {
  img: (props) => <Image {...(props as ImageProps)} loading='lazy' />,
  pre: Codeblock,
  MathBox,
  MathTooltip,
  LatexFig,
  ChessFig,
}
