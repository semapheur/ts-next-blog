import { Element, Root } from 'hast'
import {hasProperty} from 'hast-util-has-property'
import {Transformer} from 'unified'
import {selectAll, select} from 'hast-util-select'
import {visit} from 'unist-util-visit'

export function rehypeMathref(options?: Options): void | Transformer<Root, Root> {
  const boxCount = {
    'algorithm': 0,
    'axiom': 0,
    'conjecture': 0,
    'corollary': 0,
    'criteria': 0,
    'definition': 0,
    'example': 0,
    'lemma': 0,
    'observation': 0,
    'property': 0,
    'proposition': 0,
    'proof': 0,
    'remark': 0,
    'theorem': 0
  }

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

    visit(root, 'mdxJsxFlowElement', (node) => {
      if (node.name !== 'MathBox') return
      
      let id = ''
      let boxType = ''
      for (const attribute of node.attributes) {
        if (!('name' in attribute)) continue

        if (attribute.name === 'boxType') {
          boxType = (attribute.value as string)
        }
        if (attribute.name === 'tag') {
          id = (attribute.value as string)
        }
      }
      if (!id || !(boxType in boxCount)) {
        if (boxType in boxCount) boxCount[boxType]++
        return
      }

      const boxRefs = selectAll(`a[href="#${id}"] > span.mord.text > span.mord`, root)
      for (let i=0; i < boxRefs.length; i++) {
        boxRefs[i].children = [{type: 'text', value: `${boxCount[boxType]}`}]
      }
      boxCount[boxType]++
    })
  }
}