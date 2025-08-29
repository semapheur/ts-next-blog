"use client"

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote"

import { mdxComponents } from "lib/utils/mdxComponents"

interface Props {
  source: MDXRemoteSerializeResult
}

export default function MDXContent({ source }: Props) {
  return <MDXRemote {...source} components={mdxComponents} />
}
