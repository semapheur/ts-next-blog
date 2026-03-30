import { formatBibliography } from "lib/utils/bib";

interface Props {
  references: string[];
  style: string;
}

export default function Bibliography({ references, style }: Props) {
  const html = formatBibliography(references, style);

  return (
    <section>
      <h1 id="references">References</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
