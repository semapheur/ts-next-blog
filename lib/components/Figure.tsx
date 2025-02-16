type Props = {
  width?: number
  src: string
  alt?: string
  caption: string
  children: string
}

export default function Figure({ width = 70, src, alt, caption }: Props) {
  if (!alt) {
    alt = src.match(/(?<=\/)\w+(?=.(svg|png|gif))/)![0]
  }

  return (
    <figure className="relative flex flex-col">
      <img
        className="mx-auto mb-0 bg-white"
        alt={alt}
        src={src}
        width={`${width}%`}
      />
      <figcaption className="text-center before:font-bold before:content-['Figure_'_counter(fig)_':_'] before:[counter-increment:fig]">
        {caption}
      </figcaption>
    </figure>
  )
}
