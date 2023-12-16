import { SVGProps } from 'react';

export default function Loader({...props}: SVGProps<SVGSVGElement>) {
  const size = {x: 100, y: 50};
  const o = {x: size.x/2, y: size.y/2}
  const r = 15;
  const a = r / Math.sqrt(2); //Math.sin(Math.PI/4)
  const l = Math.PI * r;
  const g = Math.ceil((3 * Math.PI + 4) * r);

  const d = `
    M${o.x + a},${o.y - a},A${r},${r},0,1,1,${o.x + a},${o.y + a} 
    L${o.x - a},${o.y - a}A${r},${r},0,1,0,${o.x - a},${o.y + a}z
  `

  return (
    <svg xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${size.x} ${size.y}`} fill='none'
      className={'stroke-text/50 self-center'}
      {...props}
    >
      <path id='inf' d={d} strokeWidth='5' strokeLinecap='round' />
      <use href='#inf' 
        strokeDasharray={`${l} ${g-l}`} strokeDashoffset={`${g}`} 
        className='animate-draw stroke-secondary'
      />
    </svg>
  )
}
