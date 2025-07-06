"use client"

import {
  type HTMLProps,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { CrossIcon } from "lib/utils/icons"
import useEventListener from "lib/hooks/useEventListener"

interface Props extends HTMLProps<HTMLDialogElement> {
  isOpen: boolean
  children: ReactNode
  onClose?: () => void
  title?: string
  className?: string
}

const modalStyle =
  "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden max-w-[min(90vw,100ch)] max-h-[min(90vh,100ch)] bg-primary/50 rounded-lg shadow-md dark:shadow-black/50 backdrop-blur-sm backdrop:bg-stone-500/50"

export default function LatexModal({
  isOpen,
  children,
  onClose,
  title,
  className = modalStyle,
}: Props) {
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
  useEventListener("click", handleClick, modalRef)

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
    setModalOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Escape") {
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
    <dialog ref={modalRef} onKeyDown={handleKeyDown} className={className}>
      <div className="grid max-h-[80vh] grid-rows-[auto_1fr]">
        <header className="flex justify-between p-1">
          {title && <h3 className="self-center text-text">{title}</h3>}
          <button onClick={handleClose} className="self-end" type="button">
            <CrossIcon className="h-6 w-6 stroke-text hover:stroke-red-600" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
