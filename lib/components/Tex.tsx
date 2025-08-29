import React, {
  type HTMLProps,
  type ReactElement,
  useEffect,
  useState,
} from "react"

import KaTeX, { type ParseError } from "katex"

interface TexProps extends HTMLProps<HTMLDivElement> {
  errorColor: string
  math?: string
  children?: string
  block?: boolean
  renderError?: (e: ParseError | TypeError) => ReactElement
}

export default function Tex({
  errorColor,
  math,
  children,
  block,
  renderError,
  ...props
}: TexProps) {
  const Component = block ? "div" : "span"
  const content = children ?? math
  const [state, setState] = useState<{ [key: string]: string | ReactElement }>({
    innerHtml: "",
  })

  useEffect(() => {
    if (!content) return

    try {
      const innerHtml = KaTeX.renderToString(content, {
        displayMode: !!block,
        errorColor,
        throwOnError: !!renderError,
      })

      setState({ innerHtml })
    } catch (e) {
      if (e instanceof KaTeX.ParseError || e instanceof TypeError) {
        if (renderError) {
          setState({ errorElement: renderError(e) })
        } else {
          setState({ innerHtml: e.message })
        }
      } else {
        throw e
      }
    }
  }, [content, errorColor, block, renderError])

  if ("errorElement" in state) {
    return state.errorElement as ReactElement
  }

  return (
    <Component
      {...props}
      dangerouslySetInnerHTML={{ __html: state.innerHtml as string }}
    />
  )
}
