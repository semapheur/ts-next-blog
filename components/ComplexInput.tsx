import { HTMLProps, KeyboardEvent } from 'react'
import { Signal } from '@preact/signals-react'

type Props = {
  expression: Signal<string>
} & HTMLProps<HTMLFormElement>

export default function ComplexInput({expression, ...props}: Props) {

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      expression.value = (e.target as HTMLInputElement).value
    }
  }

  return (<form action='' className={props.className} {...props} onSubmit={(e) => e.preventDefault()}>
    <input type='text' placeholder={'Complex function'} onKeyDown={handleKeyDown}/>
  </form>)
}