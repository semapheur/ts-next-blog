import { HTMLProps, KeyboardEvent } from 'react'
import { Signal } from '@preact/signals-react'

interface Props extends HTMLProps<HTMLFormElement> {
  expression: Signal<string>
  className?: string
}

export default function ComplexInput({expression, className, ...props}: Props) {

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      expression.value = (e.target as HTMLInputElement).value
    }
  }

  return (<form action='' className={className} {...props} onSubmit={(e) => e.preventDefault()}>
    <input type='text' placeholder={'Complex function'} onKeyDown={handleKeyDown}/>
  </form>)
}