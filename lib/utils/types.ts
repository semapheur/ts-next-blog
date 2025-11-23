import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type Vector from "lib/utils/vector";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Line {
  start: DOMPoint;
  end: DOMPoint;
}

export interface ViewRange {
  x: Vector;
  y: Vector;
}

export interface MDXPost<T> {
  serialized: MDXRemoteSerializeResult;
  frontmatter: T;
}

export interface NoteMatter {
  slug: string;
  title: string;
  showToc?: boolean;
}

export type NoteDetails = Record<string, NoteMatter[]>;

export interface NoteHeading {
  text: string;
  slug: string;
  level: number;
  children?: NoteHeading[];
}
