"use client";

import { type ChangeEvent, useEffect, useState } from "react";
//import useSWR, {Fetcher} from 'swr'

import type { SearchResult } from "pages/api/searchnotes";
import { XorFilter } from "bloom-filters";
import SearchBoxCompact from "lib/components/SearchBoxCompact";
import Link from "next/link";

import type { NoteIndex } from "lib/utils/types";
import notes from "content/cache/notes.json";
import tokenize from "lib/utils/tokenize";

//const searchFetcher: Fetcher<SearchResult, string> = async (query) => {
//  return await fetch(`/api/searchnotes?q=${query}`).then(res => res.json())
//}

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const handleClick = () => {
    setQuery("");
  };
  //const {data: result} = useSWR(query, searchFetcher)

  useEffect(() => {
    const result: SearchResult = [];
    const tokens = tokenize(query);

    let score = 0;
    for (const note of notes as NoteIndex[]) {
      score = tokens.filter((q) => note.title.toLowerCase().includes(q)).length;

      const xor8 = XorFilter.fromJSON(
        JSON.parse(JSON.stringify(note.filter)),
      ) as XorFilter;
      tokens.forEach((q) => {
        if (xor8.has(q)) score++;
      });

      if (score > 0) {
        result.push({
          score: score,
          slug: note.slug,
          title: note.title,
        });
      }
    }
    setSearchResult(result);
  }, [query]);

  return (
    <div className="group relative">
      <SearchBoxCompact query={query} onChange={handleChange} />
      {query && searchResult && (
        <nav className="absolute top-8 left-4 z-1 hidden rounded-b bg-primary/50 px-2 backdrop-blur-xs delay-200 hover:block peer-focus-within:block">
          <h4 className="text-text">{`${searchResult.length} results`}</h4>
          {searchResult.map((note) => (
            <Link
              className="block py-1 text-text hover:text-secondary"
              href={`notes/${note.slug}`}
              key={note.slug}
              onClick={handleClick}
            >
              {note.title}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
