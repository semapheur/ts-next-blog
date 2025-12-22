interface Props {
  tag: string;
  children: string;
}

export default function MathList({ tag, children }: Props) {
  return <section id={tag}>{children}</section>;
}
