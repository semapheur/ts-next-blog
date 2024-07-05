'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const Modal = dynamic(() => import('lib/components/LatexModal'), { ssr: false }) //import Modal from 'lib/components/Modal'

type Props = {
  width?: number
  src: string
  alt?: string
  caption: string
  children: string
}

const latex = (className: string, color: string) => {
  return (
    <svg className={className} viewBox='0 -15.592 32.209 15.592'>
      <title>See Latex code of the figure</title>
      <g transform='matrix(1 0 0 -1 0 0)' fill={color}>
        <path d='M9.11849 8.03703H8.86942C8.75974 7.0211 8.62036 5.775785 6.86724 5.775785H6.05036C5.58224 5.775785 5.56224 5.845473 5.56224 6.174223V11.4836C5.56224 11.82235 5.56224 11.96172 6.50849 11.96172H6.83724V12.27047C6.4788 12.24079 5.57224 12.24079 5.1638 12.24079C4.77536 12.24079 3.998486 12.24079 3.649736 12.27047V11.96172H3.888799C4.65567 11.96172 4.67567 11.85204 4.67567 11.4936V6.24391C4.67567 5.885472 4.65567 5.775785 3.888799 5.775785H3.649736V5.467035H8.83942L9.11849 8.03703Z' />
        <path d='M11.52006 7.239966V7.491216H11.38069C10.91319 7.491216 10.86444 7.560903 10.78756 7.756216L9.09287 12.05278C9.051 12.16434 9.03006 12.21309 8.89756 12.21309S8.74412 12.16434 8.70225 12.05278L7.091 7.972466C7.02131 7.798091 6.902561 7.491216 6.274749 7.491216V7.239966C6.511936 7.260903 6.755999 7.267778 6.99319 7.267778C7.27225 7.267778 7.7885 7.239966 7.83037 7.239966V7.491216C7.5235 7.491216 7.32819 7.630591 7.32819 7.825903C7.32819 7.881528 7.33506 7.895591 7.36287 7.965278L7.69787 8.8234H9.67881L10.08319 7.804966C10.09725 7.769966 10.11819 7.721216 10.11819 7.686216C10.11819 7.491216 9.74131 7.491216 9.55319 7.491216V7.239966L10.59225 7.267778C10.92037 7.267778 11.4435 7.246841 11.52006 7.239966ZM9.581 9.07434H7.79537L8.68819 11.34122L9.581 9.07434Z' />
        <path d='M17.16841 9.96953L16.97904 12.21078H10.892787L10.703725 9.96953H10.952475C11.092163 11.57329 11.241538 11.90204 12.7456 11.90204C12.92498 11.90204 13.18404 11.90204 13.28341 11.88203C13.49279 11.84235 13.49279 11.73266 13.49279 11.5036V6.25391C13.49279 5.91516 13.49279 5.775785 12.44685 5.775785H12.04841V5.467035C12.45685 5.497035 13.47279 5.497035 13.93091 5.497035C14.38935 5.497035 15.41529 5.497035 15.82372 5.467035V5.775785H15.42529C14.37935 5.775785 14.37935 5.91516 14.37935 6.25391V11.5036C14.37935 11.70266 14.37935 11.84235 14.55873 11.88203C14.6681 11.90204 14.93716 11.90204 15.12623 11.90204C16.6306 11.90204 16.77998 11.57329 16.91935 9.96953H17.16841Z' />
        <path d='M22.37173 5.89099H22.12266C21.8736 4.35692 21.64454 3.629736 19.9311 3.629736H18.60641C18.13829 3.629736 18.11829 3.699424 18.11829 4.028174V6.68786H19.01485C19.9811 6.68786 20.09079 6.36911 20.09079 5.52255H20.33954V8.16224H20.09079C20.09079 7.30536 19.9811 6.99661 19.01485 6.99661H18.11829V9.38724C18.11829 9.71599 18.13829 9.78567 18.60641 9.78567H19.89141C21.41548 9.78567 21.68454 9.23786 21.84391 7.85349H22.09298L21.81391 10.09474H16.205788V9.78567H16.444851C17.21173 9.78567 17.23173 9.6763 17.23173 9.31755V4.097861C17.23173 3.739424 17.21173 3.629736 16.444851 3.629736H16.205788V3.320986H21.95329L22.37173 5.89099Z' />
        <path d='M28.64889 5.467035V5.775785H28.45952C27.94171 5.775785 27.73233 5.825785 27.52327 6.134535L25.42139 9.31204L26.78608 11.31422C27.00514 11.63297 27.34389 11.95172 28.23046 11.96172V12.27047L27.12483 12.24079C26.72639 12.24079 26.24827 12.24079 25.84983 12.27047V11.96172C26.24827 11.95172 26.46733 11.73266 26.46733 11.5036C26.46733 11.40391 26.44733 11.38391 26.37764 11.27454L25.24202 9.5911L23.95702 11.5136C23.93733 11.54328 23.88733 11.62297 23.88733 11.66297C23.88733 11.78235 24.10639 11.95172 24.53483 11.96172V12.27047C24.18639 12.24079 23.45921 12.24079 23.08046 12.24079L21.785457 12.27047V11.96172H21.974832C22.52264 11.96172 22.71202 11.89203 22.90139 11.61297L24.73421 8.84391L23.10046 6.433285C22.96108 6.23391 22.66202 5.775785 21.656082 5.775785V5.467035L22.76171 5.497035C23.13046 5.497035 23.67827 5.497035 24.03671 5.467035V5.775785C23.57858 5.785785 23.40921 6.054847 23.40921 6.23391C23.40921 6.323597 23.43921 6.363598 23.50889 6.47297L24.92327 8.56485L26.49733 6.184223C26.51702 6.144535 26.54702 6.104535 26.54702 6.074535C26.54702 5.95516 26.32796 5.785785 25.89952 5.775785V5.467035C26.24827 5.497035 26.97546 5.497035 27.35389 5.497035L28.64889 5.467035Z' />
      </g>
    </svg>
  )
}

export default function LatexFig({
  width = 70,
  src,
  alt,
  caption,
  children,
}: Props) {
  const [isHovered, setHover] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

  if (!alt) {
    alt = src.match(/(?<=\/)\w+(?=.(svg|png|gif))/)![0]
  }

  return (
    <figure
      className='flex flex-col relative'
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => {}}
    >
      <img
        className='mx-auto bg-white mb-0'
        alt={alt}
        src={src}
        width={`${width}%`}
      />
      <figcaption
        className="text-center before:font-bold before:[counter-increment:fig] 
        before:content-['Figure_'_counter(fig)_':_']"
      >
        {caption}
      </figcaption>
      {isHovered && (
        <button
          className='absolute -top-10 left-1/2 -translate-x-1/2'
          type='button'
          onClick={() => setShowModal(true)}
        >
          {latex('w-12 h-12', 'rgb(var(--color-text)/1)')}
        </button>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(!showModal)}>
        {children}
      </Modal>
    </figure>
  )
}
