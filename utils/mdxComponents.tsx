import Image from 'next/image';
import { MDXComponents } from 'mdx/types';

import ChessFig from 'components/ChessFig';
import Codeblock from 'components/Codeblock';
import LatexFig from 'components/LatexFig';
import MathBox from 'components/MathBox';

export const mdxComponents: MDXComponents = {
	img: (props) => (
		// @ts-ignore
		<Image {...props} loading='lazy' />
	),
	pre: Codeblock,
	MathBox, LatexFig, ChessFig
};