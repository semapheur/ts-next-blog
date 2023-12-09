'use client'

import { HTMLProps, ReactNode, useRef, useState } from 'react'
import { ClipboardCheckIcon, ClipboardIcon } from 'utils/icons';

type Props = {
  children: ReactNode
} & HTMLProps<HTMLPreElement>

export default function Codeblock({children, ...props}: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!preRef.current) return

    setCopied(true)
    navigator.clipboard.writeText(preRef.current.textContent!)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <pre className={'group relative ' + props.className} ref={preRef} {...props} >
      <button className={`sticky right-4 float-right hidden group-hover:block
        p-1 border-2 rounded
        after:absolute after:text-sm after:px-1
        after:right-[130%] after:top-[50%] after:translate-y-[-50%]
        after:min-w-max after:rounded after:content-[attr(aria-label)]  
        after:bg-header-accent after:text-main after:opacity-0 
        after:shadow-md after:transition-opacity 
        after:hover:opacity-100 after:hover:scale-100
        ${copied ? 'border-green-400' : 'border-gray-300'}`}
        aria-label={`${copied ? 'Copied' : 'Copy'} to clipboard`}
        onClick={handleCopy}
      >
        {copied 
          ? <ClipboardCheckIcon className='w-6 h-6 stroke-green-400' />
          : <ClipboardIcon className='w-6 h-6 stroke-gray-300' /> 
        }
      </button>
      {children}
    </pre>
  )
}
