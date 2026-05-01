//import { mystParser } from 'myst-parser'
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCitation from "rehype-citation";
import rehypeImgSize from "rehype-img-size";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
//import sectionize from 'remark-sectionize'

import { rehypeFancyLists, rehypeMathref } from "./rehype";

export const remarkPlugins = [remarkGfm, remarkMath];
export const rehypePlugins = [
  rehypeSlug,
  rehypeAutolinkHeadings,
  [
    rehypeCitation,
    {
      bibliography: "content/data/references.bib",
      csl: "harvard1",
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
        "\\deq": "\\ovserset{\\text{d}}{=}",
        "\\eqas": "\\overset{\\text{a.s.}}{=}",
        "\\eqae": "\\overset{\\text{a.e.}}{=}",
        "\\iid": "\\overset{\\text{iid}}{\\sim}",
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
];
