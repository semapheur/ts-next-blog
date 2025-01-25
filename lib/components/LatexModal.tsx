"use client"

import {
  HTMLProps,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { CrossIcon } from "lib/utils/icons"
import useEventListener from "lib/hooks/useEventListener"

type Props = {
  isOpen: boolean
  children: ReactNode
  onClose?: () => void
  title?: string
  className?: string
} & HTMLProps<HTMLDialogElement>

const modalStyle =
  "fixed m-auto p-0 inset-0 overflow-hidden max-w-[min(90vw,60ch)] bg-primary/50 rounded-lg shadow-md dark:shadow-black/50 backdrop-blur-sm backdrop:bg-stone-500/50"

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
      <div className="grid grid-rows-[auto_1fr] max-h-[80vh]">
        <header className="flex justify-between p-1">
          {title && <h3 className="text-text self-center">{title}</h3>}
          <button onClick={handleClose} className="self-end" type="button">
            <CrossIcon className="h-6 w-6 stroke-text hover:stroke-red-600" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
