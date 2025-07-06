import type { HTMLProps, KeyboardEvent } from "react"
import type { Signal } from "@preact/signals-react"

interface Props extends HTMLProps<HTMLFormElement> {
  expression: Signal<string>
}

export default function ComplexInput({ expression, ...props }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      expression.value = (e.target as HTMLInputElement).value
    }
  }

  return (
    <form
      action=""
      className={props.className}
      {...props}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="text"
        placeholder={"Complex function"}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
    </form>
  )
}
