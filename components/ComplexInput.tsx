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
      expression.traverse(function(node, path, parent) {
        console.log(node.type)
        console.log(node)
      })
      //console.log(toGlsl(expression))
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (<form action='' className={className} {...props} onSubmit={(e) => e.preventDefault()}>
    <input type='text' value={inputValue} onChange={handleChange} onKeyDown={handleKeyDown}/>
  </form>)
}

function toGlsl(ast: MathNode) {
  const infixOperators = ['+', '-']
  const functions = new Set<string>()

  function callback(node: MathNode): MathNode {
    switch(node.type) {
      case 'SymbolNode': {
        if ((node as SymbolNode).name != 'i') return node
        
        functions.add('complex')
        return new FunctionNode('complex', [new ConstantNode(0), new ConstantNode(1)])
      } 
      case 'ConstantNode': {
        functions.add('complex')
        const args = [new ConstantNode((node as ConstantNode).value), new ConstantNode(0)]
        return new FunctionNode('complex', args)
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
        const fn = 'c' + (node as OperatorNode).fn
        functions.add(fn)
        
        const args = (node as OperatorNode).args
        for (let i = 0; i < args.length; i++) {
          args[i] = callback(args[i])
        }
        return new FunctionNode(fn, args)
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

  return glsl.toString()
}