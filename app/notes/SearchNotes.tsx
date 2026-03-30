"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

import SearchBox from "lib/components/SearchBox";
import { searchNotes } from "lib/utils/search";
import { type SearchResult } from "lib/utils/types";
import notes from "content/cache/notes.json";

export default function SearchNotes() {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const result = searchNotes(query, notes);
    setSearchResult(result);
  }, [query]);

  return (
    <>
      <div className="flex flex-col gap-8 divide-y p-8" key="search">
        <div className="">
          <SearchBox query={query} onChange={handleChange} />
        </div>
        <div className="overflow-y-scroll">
          {query && (
            <h4 className="text-text">
              {!searchResult
                ? ""
                : searchResult.length > 0
                  ? `Found ${searchResult.length} results (hover for preview):`
                  : "No results found! Refine your query..."}
            </h4>
          )}
          {Array.isArray(searchResult) &&
            searchResult.map((note) => (
              <Link
                className="block py-1 text-text hover:text-secondary"
                href={`/notes/${note.slug}`}
                data-tag={note.slug}
                key={note.slug}
              >
                {note.title}
              </Link>
            ))}
        </div>
      </div>
      <div className="hidden h-full justify-center overflow-y-scroll lg:flex" />
    </>
  );
}
