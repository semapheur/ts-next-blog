'use client'

import { MDXRemote } from 'next-mdx-remote';
import { useEffect, useMemo, useState } from 'react';
import useScrollspy from 'hooks/useScrollspy';
import { NoteHeading } from 'utils/types';

type TocItem = {
  heading: NoteHeading,
  activeIds: string[],
}

type Props = {
  headings: NoteHeading[]
}

function TocItem({heading, activeIds}: TocItem) {
    
  const subItem = useMemo(() => {
		return (heading.children || []).map((h, index) => (
			<TocItem key={'tocsubitem.' + index} heading={h} activeIds={activeIds}/>
		))
	}, [heading, activeIds])
  
  return (
		<li key={'li.' + heading.slug} className='list-none relative'>
			{heading.children && <>
				<input key={'input.' + heading.slug} id={heading.slug} type='checkbox'
					className='peer w-5 h-5 absolute top-1 left-0 cursor-pointer opacity-0 z-[1]'
				/>
				<label key={'label.' + heading.slug} htmlFor={heading.slug}
				className='w-5 h-5 absolute top-0 left-0 inline-block translate-y-1
					after:absolute after:top-[50%] after:left-[50%]
					after:translate-x-[-50%] after:translate-y-[-50%]
					after:content-[""] after:w-1/4 after:h-1/4
					after:block after:box-border
					after:border-text after:border-b after:border-r
					after:-rotate-45 after:peer-checked:rotate-45
					after:transition-[rotate]'
				/>
			</>}
			<a key={'a.' + heading.slug} href={`#${heading.slug}`}
				className={`inline-block pl-6 ${activeIds.includes(heading.slug) ? 'text-secondary' : 'text-text'}`}
			>
				{heading.text.includes('{"compiledSource"') ? <MDXRemote {...JSON.parse(heading.text)}/> : heading.text}
			</a>
			{heading.children &&
				<ul key={'ul.' + heading.slug}
					className='list-none h-0 overflow-hidden pl-8 peer-checked:h-auto'
				>
					{subItem}
				</ul>}
		</li>
  )
}

export default function Toc({headings}: Props) {
  const [headingIds, setHeadingIds] = useState<HTMLHeadingElement[]>([]);

  useEffect(() => {
		const result: string[] = [];

		const callback = (h: NoteHeading) => {
			result.push(`h${h.level}[id="${h.slug}"]`);
			h.children && h.children.forEach(callback)
		}

		headings.forEach(callback);
		const selector = result.toString();
		setHeadingIds(Array.from(document.querySelectorAll(selector)));
      
  }, [headings])

  const activeIds = useScrollspy(headingIds, {threshold: 0.3});

	const icon = (className: string) => {
		return (
			<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5}
				className={className}
			>
  			<path strokeLinecap='round' strokeLinejoin='round' d='M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' />
			</svg>
		)
	}

  return (
		<aside className='max-h-full h-min min-w-max m-4 p-4 overflow-y-scroll 
			bg-primary rounded-md shadow-md dark:shadow-black/50'
		>
			<div key='div' className='flex justify-start gap-x-1 border-b border-b-text'>
				<button key='button' className='cursor-default'>{icon('w-6 h-6 stroke-text')}</button>
				<h2 key='h2' className='font-bold text-text'>Contents</h2>
			</div>
			<nav key='nav' >
				<ul className='list-none h-auto'>
					{(headings || []).map((h, index) => (
						<TocItem key={'tocitem.' + index} heading={h} activeIds={activeIds} />
					))}
				</ul>
			</nav>
		</aside>
  );
}