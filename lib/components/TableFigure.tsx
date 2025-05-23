type Props = {
  caption: string
  children: string
  tag?: string
}

export default function TableFigure({ caption, children, tag }: Props) {
  return (
    <figure id={tag} className="relative flex flex-col">
      <figcaption className="text-center before:font-bold before:content-['Table_'_counter(tbl)_':_'] before:[counter-increment:tbl]">
        {caption}
      </figcaption>
      {children}
    </figure>
  )
}
