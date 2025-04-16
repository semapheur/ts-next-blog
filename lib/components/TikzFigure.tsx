"use client"

import Head from "next/head"

type Props = {
  caption: string
  children: string
  packages?: string
}

export default function TikzFigure({
  caption,
  packages = "",
  children,
}: Props) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://tikzjax.com/v1/fonts.css"
        />
        <script src="https://tikzjax.com/v1/tikzjax.js" />
      </Head>
      <figure className="relative flex flex-col">
        <div className="tikzjax-scaled-container mx-auto">
          <script
            type="text/tikz"
            data-tex-packages={packages}
            dangerouslySetInnerHTML={{ __html: children }}
          />
        </div>
        <figcaption className="text-center before:font-bold before:content-['Figure_'_counter(fig)_':_'] before:[counter-increment:fig]">
          {caption}
        </figcaption>
      </figure>
    </>
  )
}
