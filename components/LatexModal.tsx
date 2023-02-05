'use client'

import {ReactNode, useEffect, useRef} from 'react';
import { CrossIcon } from 'utils/icons';

import Portal from './Portal';

interface Props {
    isOpen: boolean;
    handleClose: () => void;
    children: ReactNode;
}

export default function LatexModal({isOpen, handleClose, children}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => {
      e.key === 'Escape' ? handleClose() : null;
    }
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey);
    };
  }, [handleClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen])
  
  if (!isOpen) return null;

  return (
    <Portal portalId='react-portal'>
      <div className='fixed inset-0 h-screen w-screen 
        flex justify-center items-center backdrop-blur-sm 
        transition-all z-[999]'
      >
        <div className='relative h-3/4 w-min pt-8 
          flex justify-center 
          bg-main border rounded-lg shadow-sm z-[9999]' 
        >
          <button className='absolute top-1 right-1'
            onClick={handleClose}
          >
            <CrossIcon className='h-6 w-6 stroke-text hover:stroke-red-600'/>
          </button>
          <div className='prose max-w-none flex justify-center h-full w-full overflow-scroll' 
            ref={contentRef}
          >
            {children}
          </div>
        </div>
      </div>
    </Portal>
  )
}