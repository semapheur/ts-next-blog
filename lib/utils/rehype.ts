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
    figure: 1,
    lemma: 1,
    observation: 1,
    property: 1,
    proposition: 1,
    proof: 1,
    remark: 1,
    table: 1,
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

    const mathElements = new Set(["MathBox", "LatexFigure", "TableFigure"])

    visit(root, "mdxJsxFlowElement", (node) => {
      if (!node.name || !mathElements.has(node.name)) return

      const attributeMap = Object.fromEntries(
        (node.attributes || [])
          .filter((attr) => "name" in attr && "value" in attr)
          // @ts-ignore
          .map((attr) => [attr.name, attr.value]),
      )

      const boxType =
        attributeMap.boxType ??
        (node.name === "LatexFigure"
          ? "figure"
          : node.name === "TableFigure"
            ? "table"
            : "")

      const id = attributeMap.tag ?? ""

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

export function rehypeFancyLists() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent: Element) => {
      if (
        node.tagName === "li" &&
        node.children &&
        node.children.length > 0 &&
        node.children[0].type === "text"
      ) {
        const textValue = node.children[0].value

        const letterMatch = textValue.match(/^[a-z]\.\s+/)
        const romanMatch = textValue.match(
          /^(?=[IVXLCDM]+\.)(I{1,3}|IV|VI{0,3}|IX|X{1,3}|XL|L|LX{0,3}|XC|C{1,3}|CD|D|DC{0,3}|CM|M{1,3})\./,
        )

        if (letterMatch || romanMatch) {
          const [identifier, ...rest] = textValue.split(". ")
          const restText = rest.join(". ").trim()
          node.children[0].value = restText

          if (parent && parent.tagName === "ul") {
            parent.tagName = "ol"
            parent.properties = parent.properties || {}

            if (letterMatch) {
              const listItemLetter = identifier.toLowerCase()
              parent.properties.type = "a"

              if (index === 0) {
                parent.properties.start = listItemLetter.charCodeAt(0) - 96
              }
            } else if (romanMatch) {
              parent.properties.type = "i"
              const startValue = romanToInt(identifier)

              if (index === 0) {
                parent.properties.start = startValue
              }
            }
          }
        }
      }
    })
  }
}

function romanToInt(roman: string): number {
  const romanMap: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }
  return roman
    .toUpperCase()
    .split("")
    .reduce((acc, curr, i, arr) => {
      const currValue = romanMap[curr]
      const nextValue = romanMap[arr[i + 1]] || 0
      return currValue < nextValue ? acc - currValue : acc + currValue
    }, 0)
}
