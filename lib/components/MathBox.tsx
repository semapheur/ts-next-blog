interface Props {
  title: string;
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
    | "theorem";
  children: string;
  tag?: string;
}

function cap(text: string): string {
  if (!text) return "Error";
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    <section className="relative my-5 rounded-sm bg-primary shadow-md dark:shadow-black/50">
      <header
        className={`sticky top-0 z-10 px-2 py-1 bg-${boxType} wrap-break-words rounded-t-sm`}
      >
        <span
          id={`${boxType}-${tag}`}
          className={`before:[counter-increment:${boxType}] before:content-['${cap(boxType)}_'_counter(${boxType})] before:font-bold`}
        >
          {title && `: ${title}`}
        </span>
      </header>
      <main className="px-4 pb-px">{children}</main>
    </section>
  );
}
