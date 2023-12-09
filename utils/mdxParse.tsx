import { serialize } from 'next-mdx-remote/serialize'

//import {bundleMDX} from 'mdx-bundler';
import {unified} from 'unified';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
//import rehypeHighlight from 'rehype-highlight';
//import rehypePrettyCode from 'rehype-pretty-code';
import rehypeImgSize from 'rehype-img-size';
//import rehypeMathjaxSvg from 'rehype-mathjax/svg.js';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { MDXPost, NoteHeading } from './types';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
//import toc from 'rehype-toc';
//import sectionize from 'remark-sectionize';

export const remarkPlugins = [remarkGfm, remarkMath];
export const rehypePlugins = [
	rehypeSlug, 
	rehypeAutolinkHeadings, 
	[rehypeImgSize, {dir: 'public'}],
	//rehypePrettyCode,
	rehypeKatex,
];

export async function serializeMDX<T>(rawMdx: string, matter = true): Promise<MDXPost<T> | MDXRemoteSerializeResult> {
	const serialized = await serialize(
		rawMdx, {
			parseFrontmatter: matter,
			mdxOptions: {
					development: process.env.NODE_ENV !== 'production',
					remarkPlugins: remarkPlugins,
					// @ts-ignore
					rehypePlugins: rehypePlugins,
			}
		}
	)
	if (matter) {
		const frontmatter = serialized.frontmatter as T
		return {serialized, frontmatter};
	}
	return serialized
}

function nest<T extends Object>(arr: Array<T>, ix: number[], value: T): void {
	for (let i of ix) {
		let obj = arr[i - 1];
		if (!('children' in obj)) obj['children'] = [];
		arr = obj['children'];
	}
	arr.push(value);
}

async function mdParser(text: string) {
	const process = await unified()
		.use(remarkParse)
		.use(remarkMath)
		.use(remarkRehype)
		.use(rehypeSlug)
		.use(rehypeKatex)
		.use(rehypeStringify)
		.process(text);

	return String(process);
}

export async function markdownHeadings(source:string) {
	const headings = source
		.split('\n')
		.filter((line) => {
			return line.match(/^#+\s/);
		})

	const slugs: {[key: string]: number} = {};
	const counter = Array(6).fill(0);

	const result: NoteHeading[] = [];
	
	for (let h of headings) {
		let text: string = h.replace(/^#+\s/, '').replace(/\r|\n/g, '').trim();

		let slug: string;
		if (h.match(/\$.+\$/g)) {
			// Parse ID created by rehype slug 
			let tags = await mdParser(h);
			slug = tags.match(/(?<=id=")[\w-]+?(?=")/u)![0];
			
			// Parse serialized mdx
			const serialized = await serializeMDX(text, false);
			text = JSON.stringify(serialized);
		} else {
			slug = text.toLowerCase().replace(/[()']|/g, '').replaceAll(' ', '-');
		}

		// Add suffix to duplicate slugs
		if (slug in slugs) {
			slug += `-${++slugs[slug]}`;
		} else {
			slugs[slug] = 0;
		}
		const level = h.match(/^#+/)![0].length;

		// Update counter
		counter[level - 1]++;
		counter.fill(0, level);

		let number: string = `${counter[0]}`;

		let i = 2;
		while (i <= level) {
			number += `.${counter[i-1]}`;
			i++;
		} 
		const obj = {
			text: text, 
			slug: slug, 
			level: level
		}

		if (level === 1) {
			result.push(obj);
		} else {
			const keys = number.split('.').map(Number).slice(0, -1);
			nest(result, keys, obj);
		}
	}
	return result;
}

// Parse MDX using mdx-bundler
//export async function compileMDX(content: string) {
//    if (process.platform === 'win32') {
//        process.env.ESBUILD_BINARY_PATH = path.join(
//            process.cwd(),
//            'node_modules',
//            'esbuild',
//            'esbuild.exe',
//        )
//    } else {
//    process.env.ESBUILD_BINARY_PATH = path.join(
//            process.cwd(),
//            'node_modules',
//            'esbuild',
//            'bin',
//            'esbuild',
//        )
//    }
//
//    const {code, frontmatter} = await bundleMDX({
//        source: content,
//        mdxOptions(options) {
//            options.remarkPlugins = [
//                ...(options.remarkPlugins ?? []),
//                ...remarkPlugins,
//            ];
//            options.rehypePlugins = [
//                ...(options.rehypePlugins ?? []),
//                ...rehypePlugins,
//            ];
//            return options;
//        }
//    })
//    return {code, frontmatter};
//}

//type MDXProps = {
//    code: string
//}

//const MDX = ({code}: MDXProps) => {
//    const Component = useMemo(() => getMDXComponent(code), [code]);
//
//    return <Component components={mdxComponents}/>
//}