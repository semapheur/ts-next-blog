'use client'

import { useEffect, useMemo, useState } from 'react'
import {block, For} from 'million/react'
import { MDXRemote } from 'next-mdx-remote'
import useScrollspy from 'hooks/useScrollspy'
import { NoteHeading } from 'utils/types'
import { BookIcon } from 'utils/icons'

type TocItem = {
  heading: NoteHeading,
  activeIds: string[],
}

type Props = {
  headings: NoteHeading[]
}

const TocItemBlock = block(function TocItem({heading, activeIds}: TocItem) {
    
  const subItem = useMemo(() => {
		return <For each={heading.children || []} as='li'>{
			(h, index) => <TocItem key={`tocsubitem.${index}`} heading={h} activeIds={activeIds}/>
		}</For>
	}, [heading, activeIds])
  
  return (
		<li key={`li.${heading.slug}`} className='list-none relative'>
			{heading.children && <>
				<input key={`input.${heading.slug}`} id={heading.slug} type='checkbox'
					className='peer w-5 h-5 absolute top-1 left-0 cursor-pointer opacity-0 z-[1]'
				/>
				<label key={`label.${heading.slug}`} htmlFor={heading.slug}
				className='w-5 h-5 absolute top-0 left-0 inline-block translate-y-1
					after:absolute after:top-[50%] after:left-[50%]
					after:translate-x-[-50%] after:translate-y-[-75%]
					after:content-[""] after:w-1/3 after:h-1/3
					after:block after:box-border
					after:border-text after:border-b after:border-r
					after:-rotate-45 after:peer-checked:rotate-45
					after:transition-transform'
				/>
			</>}
			<a key={`a.${heading.slug}`} href={`#${heading.slug}`}
				className={`inline-block pl-6 ${activeIds.includes(heading.slug) ? 'text-secondary' : 'text-text'}`}
			>
				{heading.text.includes('{"compiledSource"') ? <MDXRemote {...JSON.parse(heading.text)}/> : heading.text}
			</a>
			{heading.children &&
				<ul key={`ul.${heading.slug}`}
					className='list-none h-0 overflow-hidden pl-4 peer-checked:h-auto'
				>
					{subItem}
				</ul>}
		</li>
  )
})

function Toggle() {
	return (
		<>
			<input key='input.toc' id='toc-toggle' type='checkbox'
				className='peer hidden'
			/>
			<label key='label.toc' htmlFor='toc-toggle' 
				className='w-10 h-10 -mr-2 pr-1 absolute top-[10%] right-0 z-[1]
				grid place-items-center cursor-pointer lg:hidden
				bg-primary/50 backdrop-blur-sm rounded-l-full shadow-tlb
				dark:shadow-black/50'
			>
				<BookIcon className='w-6 h-6 stroke-text hover:stroke-secondary' />
			</label>
		</>
	)
}

const TocBlock = block(function Toc({headings}: Props) {
  const [headingIds, setHeadingIds] = useState<HTMLHeadingElement[]>([])

  useEffect(() => {
		const result: string[] = []

		const callback = (h: NoteHeading) => {
			result.push(`h${h.level}[id="${h.slug}"]`)
			h.children?.forEach(callback)
		}

		headings.forEach(callback)
		const selector = result.toString()
		setHeadingIds(Array.from(document.querySelectorAll(selector)))
      
  }, [headings])

  const activeIds = useScrollspy(headingIds, {threshold: 0.3})

  return (
		<>
			<Toggle/>
			<aside className='flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  
				lg:static lg:translate-x-0 lg:translate-y-0 
				hidden lg:flex peer-checked:flex
				h-min min-h-0 max-h-[80%] lg:max-h-[calc(100%-16px)] lg:min-w-max
				p-2 lg:m-2 bg-primary/50 rounded-md shadow-md dark:shadow-black/50 backdrop-blur-sm'
			>
				<>
					<div key='div.toc' className='flex justify-start gap-x-1 border-b border-b-secondary'>
						<button key='button.toc' type='button' className='cursor-default'>
							<BookIcon className='w-6 h-6 stroke-text' />
						</button>
						<h2 key='h2.toc' className='font-bold text-text'>Contents</h2>
					</div>
					<nav key='nav.toc' className='overflow-y-scroll'>
						<ul className='list-none h-auto'>
						<For each={headings || []} as='li'>{
							(h, index) => <TocItemBlock key={`tocitem.${index}`} heading={h} activeIds={activeIds} />
						}</For>
						</ul>
					</nav>
				</>
			</aside>
		</>
  )
})
export default TocBlock