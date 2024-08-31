import type { Root, Element } from "hast"
import type { Transformer } from "unified"
import { selectAll, select } from "hast-util-select"
import { visit } from "unist-util-visit"

export function rehypeMathref(): Transformer<Root, Root> {
  const boxCount = {
    algorithm: 1,
    axiom: 1,
    conjecture: 1,
    corollary: 1,
    criteria: 1,
    definition: 1,
    example: 1,
    lemma: 1,
    observation: 1,
    property: 1,
    proposition: 1,
    proof: 1,
    remark: 1,
    theorem: 1,
  }

  return (root) => {
    const eqTags = selectAll("span[id].enclosing", root)

    for (let i = 0; i < eqTags.length; i++) {
      const id = eqTags[i].properties.id

      const eqLabel = select(
        `span[id=${id}].enclosing > span.mord.text > span.mord`,
        eqTags[i],
      )
      eqLabel!.children = [{ type: "text", value: `${i + 1}` }]

      const eqRefs = selectAll(
        `a[href="#${id}"] > span.mord.text > span.mord`,
        root,
      )

      for (let j = 0; j < eqRefs.length; j++) {
        eqRefs[j].children = [{ type: "text", value: `${i + 1}` }]
      }
    }

    visit(root, "mdxJsxFlowElement", (node) => {
      if (node.name !== "MathBox") return

      let id = ""
      let boxType = ""
      for (const attribute of node.attributes) {
        if (!("name" in attribute)) continue

        if (attribute.name === "boxType") {
          boxType = attribute.value as string
        }
        if (attribute.name === "tag") {
          id = attribute.value as string
        }
      }
      if (!id || !(boxType in boxCount)) {
        if (boxType in boxCount) boxCount[boxType]++
        return
      }
      const boxRefs = selectAll(
        `a[href="#${id}"] > span.mord.text > span.mord`,
        root,
      )
      for (let i = 0; i < boxRefs.length; i++) {
        boxRefs[i].children = [{ type: "text", value: `${boxCount[boxType]}` }]
      }
      boxCount[boxType]++
    })
  }
}

export function rehypeLetteredLists() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent: Element) => {
      if (
        node.tagName === "li" &&
        node.children &&
        node.children.length > 0 &&
        node.children[0].type === "text" &&
        node.children[0].value.match(/^[a-z]\.\s+/)
      ) {
        const [letter, ...rest] = node.children[0].value.split(". ")
        const restText = rest.join(". ").trim()
        node.children[0].value = restText
        const listItemLetter = letter.toLowerCase()

        if (parent && parent.tagName === "ul") {
          parent.tagName = "ol"
          parent.properties = parent.properties || {}
          parent.properties.type = "a"
          // Set the `start` attribute only if this is the first item, ensuring correct list numbering.
          if (index === 0) {
            parent.properties.start = listItemLetter.charCodeAt(0) - 96
          }
        }
      }
    })
  }
}
