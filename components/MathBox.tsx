type Props = {
  title: string;
  boxType: string;
  children: string; //{children: ReactNode};
}

function cap(text: string): string {
  if (!text) return 'Error'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/* Tailwind CSS classes
bg-axiom bg-theorem bg-lemma bg-corollary bg-proposition bg-definition bg-example
border-axiom border-theorem border-lemma border-corollary border-proposition border-definition border-example
before:[counter-increment:axiom] before:content-['Axiom_'_counter(axiom)_':_']
before:[counter-increment:theorem] before:content-['Theorem_'_counter(theorem)_':_']
before:[counter-increment:lemma] before:content-['Lemma_'_counter(lemma)_':_']
before:[counter-increment:corollary] before:content-['Corollary_'_counter(corollary)_':_']
before:[counter-increment:proposition] before:content-['Proposition_'_counter(proposition)_':_']
before:[counter-increment:definition] before:content-['Definition_'_counter(definition)_':_']
before:[counter-increment:example] before:content-['Example_'_counter(example)_':_']
*/

export default function MathBox({title, boxType, children}: Props) {
  return (
    <div className={`relative px-3 pt-2 my-8 md:my-8 bg-main border-2 border-${boxType} rounded-lg shadow-md`}>
      <span className={`inline-block absolute top-0 translate-y-[-50%] px-2 max-w-[calc(100%-1.5rem)] overflow-x-scroll 
        whitespace-nowrap bg-${boxType} rounded-md font-bold shadow-sm
        before:[counter-increment:${boxType}] before:content-['${cap(boxType)}_'_counter(${boxType})_':_']`}
      >
        {title}
      </span>
      {children}
    </div>
  )
}


