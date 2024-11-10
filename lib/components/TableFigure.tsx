type Props = {
  caption: string
  children: string
}

export default function TableFigure({ caption, children }: Props) {
  return (
    <figure className="flex flex-col relative">
      <figcaption
        className="text-center before:font-bold before:[counter-increment:tbl] 
        before:content-['Table_'_counter(tbl)_':_']"
      >
        {caption}
      </figcaption>
      {children}
    </figure>
  )
}
