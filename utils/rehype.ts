import { Element, Root } from 'hast'
import {hasProperty} from 'hast-util-has-property'
import {Transformer} from 'unified'
import {visit} from 'unist-util-visit'


export function rehypeMathref(options?: Options): void | Transformer<Root, Root> {

  return (root) => {
    let count = 0
    
    visit(root, 'element', (node: Element) => {
      if (node.tagName === 'span' && hasProperty(node, 'id')) {
        console.log(node)
        count++
      }
    })
  }
}

/*
{
  type: 'element',
  tagName: 'span',
  properties: { className: [ 'enclosing' ], id: 'eq1' },
  children: []
}
*/