import Image, {ImageProps} from 'next/image'
import { MDXComponents } from 'mdx/types'

import ChessFig from 'components/ChessFig'
import Codeblock from 'components/Codeblock'
import LatexFig from 'components/LatexFig'
import MathBox from 'components/MathBox'
import MathTooltip from 'components/MathTooltip'

export const mdxComponents: MDXComponents = {
	img: (props) => (
		<Image {...(props as ImageProps)} loading='lazy' />
	),
	pre: Codeblock,
	MathBox, MathTooltip, LatexFig, ChessFig
}