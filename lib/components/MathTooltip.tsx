interface Props {
  content: string
  children: string //{children: ReactNode};
}

export default function MathTooltip({ content, children }: Props) {
  return (
    <abbr
      data-tooltip={content}
      className="relative after:absolute after:left-full after:rounded-sm after:bg-text/50 after:p-1 after:text-primary after:text-sm after:backdrop-blur-md hover:after:block hover:after:content-[attr(data-tooltip)]"
    >
      {children}
    </abbr>
  )
}
