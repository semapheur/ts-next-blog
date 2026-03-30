import fs from "node:fs";
import Cite from "citation-js";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";

export function formatBibliography(
  referenceKeys: string[],
  style = "harvard1",
  locale = "en-US",
) {
  const bibtexRaw = fs.readFileSync("content/data/references.bib", "utf-8");
  const bibCite = new Cite(bibtexRaw);

  const filtered = new Cite(
    bibCite.data.filter((entry) => referenceKeys.includes(entry.id)),
  );

  return filtered.format("bibliography", {
    format: "html",
    template: style,
    lang: locale,
  });
}
