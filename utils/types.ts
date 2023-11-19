import { MDXRemoteSerializeResult } from 'next-mdx-remote'

export type Vec2 = {
  x: number,
  y: number
}

export type Line = {
  start: Vec2,
  end: Vec2 
}

export type MDXPost<T> = {
  serialized: MDXRemoteSerializeResult,
  frontmatter: T
}

export type NoteMatter = {
  slug: string,
  title: string,
  showToc?: boolean
}

export type NoteDetails = {
  [subject: string]: NoteMatter[]
}

export type NoteHeading = {
  text: string;
  slug: string;
  level: number;
  children?: NoteHeading[];
}