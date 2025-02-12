type Props = {
  caption: string
  children: string
}

export default function TableFigure({ caption, children }: Props) {
  return (
    <figure className="relative flex flex-col">
      <figcaption className="text-center before:font-bold before:content-['Table_'_counter(tbl)_':_'] before:[counter-increment:tbl]">
        {caption}
      </figcaption>
      {children}
    </figure>
  )
}
