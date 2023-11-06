'use client'

import {KeyboardEvent, ReactNode, useEffect, useRef, useState} from 'react'
import { CrossIcon } from 'utils/icons'
import useEventListener from 'hooks/useEventListener'

type Props = {
  isOpen: boolean
  children: ReactNode
  onClose?: () => void
}

export default function LatexModal({isOpen, children, onClose}: Props) {
  const [isModalOpen, setModalOpen] = useState(isOpen)
  const modalRef = useRef<HTMLDialogElement>(null)

  const handleClick = (e: MouseEvent) => {
    const modal = modalRef.current
    if (!modal) return

    const modalSize = modal.getBoundingClientRect()
    if (
      e.clientX < modalSize.left ||
      e.clientX > modalSize.right ||
      e.clientY < modalSize.top ||
      e.clientY > modalSize.bottom
    ) {
      handleClose()
    }
  }
  useEventListener('click', handleClick, modalRef)

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
    setModalOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key == 'Escape') {
      handleClose()
    }
  }

  useEffect(() => {
    setModalOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    const modal = modalRef.current
    if (modal) {
      if (isModalOpen) {
        modal.showModal()
      } else {
        modal.close()
      }
    }
  }, [isModalOpen])
  
  return (
    <dialog ref={modalRef} onKeyDown={handleKeyDown}
      className='relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
        h-3/4 max-w-3/4 px-1 pt-2 bg-main/50 border rounded-lg shadow-sm backdrop-blur'
    >
      <button onClick={handleClose}
        className='absolute top-1 right-1'
      >
        <CrossIcon className='h-6 w-6 stroke-text hover:stroke-red-600'/>
      </button>
      <div className='prose flex justify-center h-full w-full overflow-scroll'>
        {children}
      </div>
    </dialog>
  )
}