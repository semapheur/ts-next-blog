"use client";

import { LatexIcon } from "lib/utils/icons";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const Modal = dynamic(() => import("lib/components/LatexModal"), {
  ssr: false,
});

interface FallbackImage {
  src: string;
  alt?: string;
  width?: number;
}

interface Props {
  caption: string;
  children: string;
  packages?: string;
  tag?: string;
  fallbackImage?: FallbackImage;
}

export default function TikzFigure({
  caption,
  packages = "",
  fallbackImage,
  tag,
  children,
}: Props) {
  const [isHovered, setHover] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tikzCodeHighlighted, setTikzCodeHighlighted] = useState<string>("");

  let packageText = "";
  try {
    const parsed = JSON.parse(packages);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Invalid packages format");
    }

    for (const [key, value] of Object.entries(parsed)) {
      if (value === "") {
        packageText += `\\usepackage{${key}}\n`;
        continue;
      }
      packageText += `\\usepackage[${value}]{${key}}\n`;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      packageText = `\\usepackage{${packages.trim()}}\n`;
    } else {
      throw error;
    }
  }

  useEffect(() => {
    const processTikzCode = async () => {
      const tikzCode = String.raw`
\documentclass[tikz, border=5pt]{standalone}
${packageText}
\begin{document}
${children}
\end{document}
`;

      const tikzCodeHighlighted = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypePrettyCode)
        .use(rehypeStringify)
        .process(`\`\`\`latex ${tikzCode}\`\`\``);

      setTikzCodeHighlighted(String(tikzCodeHighlighted));
    };

    processTikzCode();
  }, [children, packageText]);

  return (
    <figure
      id={tag}
      className="relative flex flex-col"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => {}}
    >
      <div className="tikzjax-scaled-container mx-auto">
        <script
          type="text/tikz"
          data-tex-packages={packages.trim()}
          dangerouslySetInnerHTML={{ __html: children }}
        />
        {fallbackImage && (
          <noscript>
            <img
              className="mx-auto mb-0 bg-white"
              alt={fallbackImage?.alt}
              src={fallbackImage.src}
              width={`${fallbackImage.width}%`}
            />
          </noscript>
        )}
      </div>
      <figcaption className="text-center before:font-bold before:content-['Figure_'_counter(figure)_':_'] before:[counter-increment:figure]">
        {caption}
      </figcaption>
      {isHovered && (
        <button
          className="-top-10 -translate-x-1/2 absolute left-1/2"
          type="button"
          onClick={() => setShowModal(true)}
        >
          <LatexIcon className="h-12 w-12" color="rgb(var(--color-text)/1)" />
        </button>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(!showModal)}>
        <div
          className="size-full"
          dangerouslySetInnerHTML={{
            __html: tikzCodeHighlighted || "<pre>Loading...</pre>",
          }}
        />
      </Modal>
    </figure>
  );
}
