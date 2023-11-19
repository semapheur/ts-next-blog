import { HTMLProps, KeyboardEvent } from 'react'
import { Signal } from '@preact/signals-react'

interface Props extends HTMLProps<HTMLFormElement> {
  inputFunction: Signal<string>
  className?: string
}

export default function ComplexInput({inputFunction, className, ...props}: Props) {

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputFunction.value = (e.target as HTMLInputElement).value
    }
  }

  return (<form action='' className={className} {...props} onSubmit={(e) => e.preventDefault()}>
    <input type='text' onKeyDown={handleKeyDown}/>
  </form>)
}