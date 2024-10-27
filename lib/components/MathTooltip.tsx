type Props = {
  content: string
  children: string //{children: ReactNode};
}

export default function MathTooltip({ content, children }: Props) {
  return (
    <abbr
      data-tooltip={content}
      className="relative after:absolute after:left-full
      after:bg-text/50 after:text-primary after:text-sm
      after:backdrop-blur-md after:p-1 after:rounded
      hover:after:block hover:after:content-[attr(data-tooltip)]"
    >
      {children}
    </abbr>
  )
}
