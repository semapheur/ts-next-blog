"use client"

import { useEffect } from "react"

type Props = {
  caption: string
  children: string
}

export default function TikzFigure({ caption, children }: Props) {
  return (
    <figure className="flex flex-col relative">
      <div className="mx-auto">
        <script
          type="text/tikz"
          dangerouslySetInnerHTML={{ __html: children }}
        />
      </div>
      <figcaption
        className="text-center before:font-bold before:[counter-increment:fig] 
        before:content-['Figure_'_counter(fig)_':_']"
      >
        {caption}
      </figcaption>
    </figure>
  )
}
