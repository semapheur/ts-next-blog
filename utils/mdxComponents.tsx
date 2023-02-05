import Image from 'next/image';
import { MDXComponents } from 'mdx/types';

import MathBox from 'components/MathBox';
import LatexFig from 'components/LatexFig';
import Codeblock from 'components/Codeblock';

export const mdxComponents: MDXComponents = {
	img: (props) => (
		// @ts-ignore
		<Image {...props} loading='lazy' />
	),
	pre: Codeblock,
	MathBox, LatexFig
};