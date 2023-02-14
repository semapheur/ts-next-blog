import { SVGProps } from "react"

type Props = {
  className: string
}

export function SearchIcon({className='w-6 h-6'}: Props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} 
      className={className}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
    </svg>)
}

export function CrossIcon({className='w-6 h-6'}: Props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} 
      className={className}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
    </svg>)
}

export function CopyIcon({className='w-6 h-6'}: Props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5}
      className={className}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75' />
    </svg>)
}

export function ClipboardIcon({className='w-6 h-6'}: Props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5}
      className={className}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
    </svg>)
}

export function ClipboardCheckIcon({className='w-6 h-6'}: Props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5}
      className={className}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
    </svg>)
}

export function King() {

  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='45' height='45'>
      <g fill='none' fillRule='evenodd' stroke='#000' strokeWidth={1.5} 
        strokeLinecap='round' strokeLinejoin='round' 
        strokeMiterlimit={4} strokeDasharray='none' strokeOpacity={1}
      >
        <path strokeLinejoin='miter'
          d='M22.5,11.63L22.5,6' 
        />
        <path fill='#000' strokeLinecap='butt' strokeLinejoin='miter'
          d='M22.5,25C22.5,2527,17.525.5,14.5C25.5,14.524.5,1222.5,12C20.5,1219.5,14.519.5,14.5C18,17.522.5,2522.5,25'
        />
        <path fill='#000' stroke='#000'
          d='M12.5,37C18,40.527,40.532.5,37L32.5,30C32.5,3041.5,25.538.5,19.5C34.5,1325,1622.5,23.5L22.5,27L22.5,23.5C20,1610.5,136.5,19.5C3.5,25.512.5,3012.5,30L12.5,37'
        />
        <path stroke='#000' strokeLinejoin='miter'
          d='M20,8L25,8'
        />
        <path fill='none' stroke='#fff'
          d='M32,29.5C32,29.540.5,25.538.03,19.85C34.15,1425,1822.5,24.5L22.5,26.6L22.5,24.5C20,1810.85,146.97,19.85C4.5,25.513,29.513,29.5'
        />
        <path fill='none' stroke='#fff'
          d='M12.5,30C18,2727,2732.5,30M12.5,33.5C18,30.527,30.532.5,33.5M12.5,37C18,3427,3432.5,37'
        />
      </g>
    </svg>
  )
}
