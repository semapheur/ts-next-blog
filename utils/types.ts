import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import Vector from 'utils/vector'

export type Vec2 = {
  x: number,
  y: number
}

export type Line = {
  start: DOMPoint,
  end: DOMPoint 
}

export type ViewRange = {
  x: Vector,
  y: Vector
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