interface Props {
  caption: string
  children: string
  tag?: string
}

export default function TableFigure({ caption, children, tag }: Props) {
  return (
    <figure id={tag} className="relative flex flex-col">
      <figcaption className="text-center before:font-bold before:content-['Table_'_counter(table)_':_'] before:[counter-increment:table]">
        {caption}
      </figcaption>
      {children}
    </figure>
  )
}
