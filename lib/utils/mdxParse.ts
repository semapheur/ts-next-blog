import { serialize } from "next-mdx-remote/serialize"
import path from "node:path"

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
import type { MDXPost, NoteHeading } from "./types"
import type { MDXRemoteSerializeResult } from "next-mdx-remote"
//import toc from 'rehype-toc'
//import sectionize from 'remark-sectionize'

import { rehypeMathref, rehypeFancyLists } from "./rehype"

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
        macros: {
          "\\d": "\\mathrm{d}",
          "\\D": "\\mathrm{D}",
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

function nest<T extends object>(arr: T[], ix: number[], value: T): void {
  for (const i of ix) {
    const obj = arr[i - 1]
    if (!("children" in obj)) obj["children"] = []
    arr = obj["children"]
  }
  arr.push(value)
}

export async function markdownHeadings(source: string) {
  const headings = source.split("\n").filter((line) => {
    return line.match(/^#+\s/)
  })

  const slugs: { [key: string]: number } = {}
  const counter = Array(6).fill(0)

  const result: NoteHeading[] = []

  for (const h of headings) {
    let text: string = h.replace(/^#+\s/, "").replace(/\r|\n/g, "").trim()
    let slug = text
      .toLowerCase()
      .replace(/[\\${}()']|/g, "")
      .replaceAll(" ", "-")

    if (text.match(/\$.+\$/g)) {
      text = await serializeMDX(text, false).then((res) => JSON.stringify(res))
    }

    // Add suffix to duplicate slugs
    if (slug in slugs) {
      slug += `-${++slugs[slug]}`
    } else {
      slugs[slug] = 0
    }
    const level = h.match(/^#+/)![0].length

    // Update counter
    counter[level - 1]++
    counter.fill(0, level)

    let number = `${counter[0]}`

    let i = 2
    while (i <= level) {
      number += `.${counter[i - 1]}`
      i++
    }
    const obj = {
      text: text,
      slug: slug,
      level: level,
    }

    if (level === 1) {
      result.push(obj)
    } else {
      const keys = number.split(".").map(Number).slice(0, -1)
      nest(result, keys, obj)
    }
  }
  return result
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
