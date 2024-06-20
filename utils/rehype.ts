import { Element, Root } from 'hast'
import {hasProperty} from 'hast-util-has-property'
import {Transformer} from 'unified'
import {selectAll, select} from 'hast-util-select'
import {visit} from 'unist-util-visit'

export function rehypeMathref(options?: Options): void | Transformer<Root, Root> {

  return (root) => {

    const eqTags = selectAll('span[id].enclosing', root)

    for (let i=0; i < eqTags.length; i++) {
      const id = eqTags[i].properties.id

      const eqLabel = select(`span[id=${id}].enclosing > span.mord.text > span.mord`, eqTags[i])
      eqLabel!.children = [{type: 'text', value: `${i}`}]

      const eqRefs = selectAll(`a[href="#${id}"] > span.mord.text > span.mord`, root)
      
      for (let j=0; j < eqRefs.length; j++) {
        eqRefs[j].children = [{type: 'text', value: `${i}`}]
      }
    }
  }
}