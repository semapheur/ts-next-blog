type Props = {
  title: string
  boxType: 'algorithm'|'axiom'|'conjecture'|'corollary'|'criteria'|'definition'|'example'|'lemma'|'observation'|'property'|'proposition'|'proof'|'remark'|'theorem'  
  children: string //{children: ReactNode};
  tag?: string
}

function cap(text: string): string {
  if (!text) return 'Error'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/* Tailwind CSS classes
bg-axiom bg-theorem bg-lemma bg-corollary bg-proposition bg-criterion bg-definition bg-example
border-axiom border-theorem border-lemma border-corollary border-proposition bg-criterion border-definition border-example
before:[counter-increment:axiom] before:content-['Axiom_'_counter(axiom)]
before:[counter-increment:theorem] before:content-['Theorem_'_counter(theorem)]
before:[counter-increment:lemma] before:content-['Lemma_'_counter(lemma)]
before:[counter-increment:corollary] before:content-['Corollary_'_counter(corollary)]
before:[counter-increment:proposition] before:content-['Proposition_'_counter(proposition)]
before:[counter-increment:criterion] before:content-['Criterion_'_counter(criterion)]
before:[counter-increment:definition] before:content-['Definition_'_counter(definition)]
before:[counter-increment:example] before:content-['Example_'_counter(example)]
*/

export default function MathBox({title, boxType, children, tag}: Props) {
  return (
    <aside className='my-5 bg-primary rounded shadow-md dark:shadow-black/50'>
      <div className={`px-2 py-1 bg-${boxType} rounded-t break-words`}>
        <span id={tag}
          className={`before:[counter-increment:${boxType}] before:content-['${cap(boxType)}_'_counter(${boxType})] before:font-bold`}
        >
          {title && `: ${title}`}
        </span>
      </div>
      <div className='px-4 pb-px'>
        {children}
      </div>
    </aside>
  )
}

function MathBoxOld({title, boxType, children, tag}: Props) {
  return (
    <div className={`relative px-3 pt-2 my-8 md:my-8 bg-main border-2 border-${boxType} rounded-lg shadow-md`}>
      <span id={tag} className={`inline-block absolute top-0 translate-y-[-50%] px-2 max-w-[calc(100%-1.5rem)] overflow-x-scroll whitespace-nowrap bg-${boxType} rounded-md font-bold shadow-sm before:[counter-increment:${boxType}] before:content-['${cap(boxType)}_'_counter(${boxType})_':_']`}
      >
        {title}
      </span>
      {children}
    </div>
  )
}


