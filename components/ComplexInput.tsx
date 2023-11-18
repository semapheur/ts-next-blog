import { ChangeEvent, HTMLProps, KeyboardEvent, useState } from 'react'
import {
  parse, 
  ConstantNode, 
  FunctionNode, 
  MathNode,
  OperatorNode,
  ParenthesisNode,
  SymbolNode,   
} from 'mathjs'

interface Props extends HTMLProps<HTMLFormElement> {
  className?: string
}

export default function ComplexInput({className, ...props}: Props) {
  const [inputValue, setInputValue] = useState<string>('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const expression = parse(inputValue)

      const [glsl, fns] = toGlsl(expression)

    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (<form action='' className={className} {...props} onSubmit={(e) => e.preventDefault()}>
    <input type='text' value={inputValue} onChange={handleChange} onKeyDown={handleKeyDown}/>
  </form>)
}

function toGlsl(ast: MathNode): [string, Set<string>] {
  const vecOperators = new Set<string>(['+', '-'])
  const functions = new Set<string>()

  function callback(node: MathNode): MathNode {
    switch(node.type) {
      case 'SymbolNode': {
        if ((node as SymbolNode).name != 'i') return node
        
        return new FunctionNode('vec2', [new ConstantNode(0), new ConstantNode(1)])
      } 
      case 'ConstantNode': {
        const args = [new ConstantNode((node as ConstantNode).value), new ConstantNode(0)]
        return new FunctionNode('vec2', args)
      }
      case 'FunctionNode': {
        const fn = 'c' + (node as FunctionNode).fn.name
        functions.add(fn)

        const args = (node as FunctionNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }
        return new FunctionNode(fn, args) 
      }
      case 'OperatorNode': {
        const op = (node as OperatorNode).op
        const fn = 'c' + (node as OperatorNode).fn
        
        const args = (node as OperatorNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }

        if (vecOperators.has(op)) {
          return new OperatorNode(op, op, args)
        } else {
          functions.add(fn)
          return new FunctionNode(fn, args)
        } 
      }
      case 'ParenthesisNode': {
        return callback((node as ParenthesisNode).content)
      }
      default: {
        return node
      }
    }
  }

  const glsl = ast.transform(callback)

  return [glsl.toString(), functions]
}