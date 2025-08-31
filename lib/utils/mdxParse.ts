import type { MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
//import { mystParser } from 'myst-parser'
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCitation from "rehype-citation"
import rehypeImgSize from "rehype-img-size"
import rehypeKatex from "rehype-katex"
//import rehypeMathjax from 'rehype-mathjax/chtml'
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import type { MDXPost } from "./types"
//import toc from 'rehype-toc'
//import sectionize from 'remark-sectionize'

import { rehypeFancyLists, rehypeMathref } from "./rehype"

export const remarkPlugins = [remarkGfm, remarkMath]
export function rehypePlugins(noCite: string[] = []) {
  return [
    rehypeSlug,
    rehypeAutolinkHeadings,
    [
      rehypeCitation,
      {
        bibliography: "", //path.join("content", "data", "references.bib"),
        csl: "harvard1",
        noCite: noCite,
      },
    ],
    [rehypeImgSize, { dir: "public" }],
    rehypePrettyCode,
    [
      rehypeKatex,
      {
        trust: (context) => ["\\htmlId", "\\href"].includes(context.command),
        maxExpand: 10000,
        macros: {
          "\\d": "\\mathrm{d}",
          "\\D": "\\mathrm{D}",
          "\\mat": "\\mathbf{#1}",
          "\\atanh": "\\operatorname{atanh}",
          "\\norm": "\\lVert{#1}\\rVert",
          "\\Norm": "\\left\\lVert{#1}\\right\\rVert",
          "\\tleq": "\\overset{\\tiny{\\mathbf{\\triangle}}}{\\leq}",
          "\\unitvec": "\\hat{\\mathbf{#1}}",
          "\\unitsym": "\\hat{\\boldsymbol{#1}}",
          "\\eqref": "\\href{###1}{(\\text{#1})}",
          "\\ref": "\\href{###1}{\\text{#1}}",
          "\\label": "\\htmlId{#1}{\\text{#1}}",
        },
      },
    ],
    rehypeMathref,
    rehypeFancyLists,
    //[rehypeMathjax, {
    //	loader: {
    //    load: ['[custom]/xypic.js'],
    //    paths: {custom: 'https://cdn.jsdelivr.net/gh/sonoisa/XyJax-v3@3.0.1/build/'}
    //  },
    //  tex: {
    //    packages: {'[+]': ['xypic']},
    //		inlineMath: [ ['$','$'], ['\\(','\\)'] ]
    //  },
    //	chtml: {
    //    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'
    //  }
    //}]
  ]
}

export async function serializeMDX<T>(
  rawMdx: string,
  matter = true,
): Promise<MDXPost<T> | MDXRemoteSerializeResult> {
  const serialized = await serialize(rawMdx, {
    parseFrontmatter: matter,
    mdxOptions: {
      development: process.env.NODE_ENV !== "production",
      remarkPlugins: remarkPlugins,
      // @ts-ignore
      rehypePlugins: rehypePlugins([]),
    },
  })
  if (matter) {
    const frontmatter = serialized.frontmatter as T
    return { serialized, frontmatter }
  }
  return serialized
}

//export async function compileMDX(content: string) {
//	if (process.platform === 'win32') {
//		process.env.ESBUILD_BINARY_PATH = path.join(
//			process.cwd(),
//			'node_modules',
//			'esbuild',
//			'esbuild.exe',
//		)
//	} else {
//	process.env.ESBUILD_BINARY_PATH = path.join(
//			process.cwd(),
//			'node_modules',
//			'esbuild',
//			'bin',
//			'esbuild',
//		)
//	}
//
//	const {code, frontmatter} = await bundleMDX({
//		source: content,
//		mdxOptions(options) {
//			options.remarkPlugins = [
//				...(options.remarkPlugins ?? []),
//				...remarkPlugins,
//			]
//			options.rehypePlugins = [
//				...(options.rehypePlugins ?? []),
//				...rehypePlugins,
//			]
//			return options
//		}
//	})
//	return {code, frontmatter}
//}
