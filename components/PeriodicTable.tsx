'use client'

import { useState, PointerEvent } from 'react'

import BohrAtom from 'components/BohrAtom'
import SpectralLines from 'components/SpectralLines'

import data from 'content/data/elements.json'

type Element = typeof data[0]

type ElementProps = {
  element: Element|undefined
}

function ElementInfo({element}: ElementProps) {
  if (!element) return <></>

  const description = (element.year_discovered === null) ? 'Undiscovered' 
    : ((typeof element.year_discovered === 'string') ? 'Known since ancient times'
      : `Discovered in ${element.year_discovered} by ${element.discovered_by}` )

  return (<>
    <h1 className='m-auto text-[clamp(1rem,1cqw+1rem,2rem)] text-text leading-none col-span-3'>
      {`${element.number} - ${element.name} `}
      <small>{`(${element.group_block})`}</small><br/>
      <small className='italic text-sm'>{description}</small>
    </h1>
    {element?.shells &&
      <BohrAtom number={(element.number as number)} symbol={element.symbol} shells={element.shells} 
        className='h-full row-span-2'/>
    }
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Atomic mass <abbr title='Atomic mass unit: 1.66×10−27 kg'>(u)</abbr></h2>
      <strong className='text-[5cqw]'>{element.atomic_mass?.toFixed(3)}</strong>
    </section>
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Density <abbr>(g/cm³)</abbr></h2>
      <strong className='text-[5cqw]'>{element.density?.toFixed(3)}</strong>
    </section>
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Spectral lines</h2>
      <SpectralLines wavelengths={element.emission_wavelengths_nm} name={element.name} 
        width='100%' height='2rem' preserveAspectRatio='none'/>
    </section>
  </>)
}

export default function PeriodicTable() {
  const [selElement, setElement] = useState<Element>()

  function handleHover(event: PointerEvent<HTMLDivElement> & {
    target: HTMLDivElement
  })
  {
    const {target} = event
    if (!target) return
    event.preventDefault()

    if (target.id.includes('-')) return

    const number = parseInt(target.id)
    if (typeof number !== 'number') return

    setElement(data[number-1])
  }

  return (<div className='h-full min-h-0 min-w-0 grid gap-1 grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(10,minmax(0,1fr))]'
  > 
    <div className='h-full @container row-span-3 col-start-3 col-span-10 grid grid-rows-[1fr_2fr] grid-cols-4'>
      <ElementInfo element={selElement}/>
    </div>{
      data.map(element => 
        <div key={element.name}
          id={element.number.toString()}
          className='@container relative grid rounded-sm hover:border border-text'
          onPointerEnter={handleHover} onFocus={() => {}}
          style={{
            gridColumn: element.xpos,
            gridRow: element.ypos,
            backgroundColor: `rgb(var(--color-${element.group_block?.replaceAll(' ', '-')}))`
        }}>
          <span className='invisible @[3rem]:visible absolute top-0 left-1 text-text text-[15cqw] font-bold'>
            {element.number}
          </span>
          <span className='m-auto text-text text-[clamp(0.25rem,0.5rem+20cqw,1.5rem)]'>
            {element.symbol}
          </span>
          <span className='invisible @[3rem]:visible absolute bottom-1 left-1/2 -translate-x-1/2 text-text text-[15cqw]'>
            {element.name}
          </span>
        </div>  
      )
    }
  </div>)
}
