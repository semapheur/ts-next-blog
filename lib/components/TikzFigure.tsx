import Script from "next/script"

type FallbackImage = {
  src: string
  alt?: string
  width?: number
}

type Props = {
  caption: string
  children: string
  packages?: string
  fallbackImage?: FallbackImage
}

export default function TikzFigure({
  caption,
  packages = "",
  fallbackImage,
  children,
}: Props) {
  return (
    <figure className="relative flex flex-col">
      <div className="tikzjax-scaled-container mx-auto">
        <script
          type="text/tikz"
          data-tex-packages={packages}
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
      <figcaption className="text-center before:font-bold before:content-['Figure_'_counter(fig)_':_'] before:[counter-increment:fig]">
        {caption}
      </figcaption>
    </figure>
  )
}
