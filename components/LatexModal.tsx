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
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  useEffect(() => {
    setModalOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    if (isModalOpen) {
      modal.showModal()
    } else {
      modal.close()
    }
  }, [isModalOpen])
  
  return (
    <dialog ref={modalRef} onKeyDown={handleKeyDown}
      className='m-auto p-1 h-auto max-h-[75%] max-w-[75%]
        bg-primary/50 rounded-lg shadow-md dark:shadow-black/50 backdrop-blur
        backdrop:bg-stone-500/50'
    >
      <div className='h-full flex flex-col'>
        <button onClick={handleClose}
          className='self-end'
          type='button'
        >
          <CrossIcon className='h-6 w-6 stroke-text hover:stroke-red-600'/>
        </button>
        {children}
      </div>
    </dialog>
  )
}