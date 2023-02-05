'use client'

import {MDXRemote, type MDXRemoteSerializeResult} from 'next-mdx-remote'

import { mdxComponents } from 'utils/mdxComponents';

type Props = {
  source: MDXRemoteSerializeResult, 
}

export default function MDXContent({source}: Props) {
  return <MDXRemote {...source} components={mdxComponents}/>;
}