type Props = {
  title: string
  boxType:
    | "algorithm"
    | "axiom"
    | "conjecture"
    | "corollary"
    | "criteria"
    | "definition"
    | "example"
    | "lemma"
    | "observation"
    | "proof"
    | "property"
    | "proposition"
    | "remark"
    | "theorem"
  children: string
  tag?: string
}

function cap(text: string): string {
  if (!text) return "Error"
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/* Tailwind CSS classes
bg-axiom bg-algorithm bg-conjecture bg-corollary bg-criterion bg-definition bg-example bg-lemma bg-observation bg-proof bg-property bg-proposition bg-remark bg-theorem
border-axiom border-algorithm border-conjecture border-corollary border-criterion border-definition border-example border-lemma border-observation border-proof border-property border-proposition border-remark border-theorem
before:[counter-increment:algorithm] before:content-['Algorithm_'_counter(algorithm)]
before:[counter-increment:axiom] before:content-['Axiom_'_counter(axiom)]
before:[counter-increment:conjecture] before:content-['Conjecture_'_counter(conjecture)]
before:[counter-increment:corollary] before:content-['Corollary_'_counter(corollary)]
before:[counter-increment:criterion] before:content-['Criterion_'_counter(criterion)]
before:[counter-increment:definition] before:content-['Definition_'_counter(definition)]
before:[counter-increment:example] before:content-['Example_'_counter(example)]
before:[counter-increment:lemma] before:content-['Lemma_'_counter(lemma)]
before:[counter-increment:observation] before:content-['Observation_'_counter(observation)]
before:[counter-increment:proof] before:content-['Proof_'_counter(proof)]
before:[counter-increment:property] before:content-['Property_'_counter(property)]
before:[counter-increment:proposition] before:content-['Proposition_'_counter(proposition)]
before:[counter-increment:remark] before:content-['Remark_'_counter(remark)]
before:[counter-increment:theorem] before:content-['Theorem_'_counter(theorem)]
*/

export default function MathBox({ title, boxType, children, tag }: Props) {
  return (
    <aside className="my-5 rounded-sm bg-primary shadow-md dark:shadow-black/50">
      <div className={`px-2 py-1 bg-${boxType} break-words rounded-t`}>
        <span
          id={tag}
          className={`before:[counter-increment:${boxType}] before:content-['${cap(boxType)}_'_counter(${boxType})] before:font-bold`}
        >
          {title && `: ${title}`}
        </span>
      </div>
      <div className="px-4 pb-px">{children}</div>
    </aside>
  )
}

function MathBoxOld({ title, boxType, children, tag }: Props) {
  return (
    <div
      className={`relative my-8 border-2 bg-main px-3 pt-2 md:my-8 border-${boxType} rounded-lg shadow-md`}
    >
      <span
        id={tag}
        className={`absolute top-0 inline-block max-w-[calc(100%-1.5rem)] translate-y-[-50%] overflow-x-scroll whitespace-nowrap px-2 bg-${boxType} rounded-md font-bold shadow-xs before:[counter-increment:${boxType}] before:content-['${cap(boxType)}_'_counter(${boxType})_':_']`}
      >
        {title}
      </span>
      {children}
    </div>
  )
}
