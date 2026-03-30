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

export interface NoteIndex {
  slug: string;
  title: string;
  filter: JSON;
}

export interface SearchResult {
  score: number;
  slug: string;
  title: string;
}

export interface NoteXor {
  slug: string;
  title: string;
  filter: {
    type: string;
    _filter: string[];
    _bits: number;
    _size: number;
    _blockLength: number;
    _seed: number;
  };
}
