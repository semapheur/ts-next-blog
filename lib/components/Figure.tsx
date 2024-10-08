type Props = {
  width?: number
  src: string
  alt?: string
  caption: string
  children: string
}

export default function LatexFig({ width = 70, src, alt, caption }: Props) {
  if (!alt) {
    alt = src.match(/(?<=\/)\w+(?=.(svg|png|gif))/)![0]
  }

  return (
    <figure className="flex flex-col relative">
      <img
        className="mx-auto bg-white mb-0"
        alt={alt}
        src={src}
        width={`${width}%`}
      />
      <figcaption
        className="text-center before:font-bold before:[counter-increment:fig] 
        before:content-['Figure_'_counter(fig)_':_']"
      >
        {caption}
      </figcaption>
    </figure>
  )
}
