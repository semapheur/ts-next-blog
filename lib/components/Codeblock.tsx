"use client";

import { type HTMLProps, type ReactNode, useRef, useState } from "react";
import { ClipboardCheckIcon, ClipboardIcon } from "lib/utils/icons";

interface Props extends HTMLProps<HTMLPreElement> {
  children: ReactNode;
}

export default function Codeblock({ children, ...props }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!preRef.current) return;

    setCopied(true);
    navigator.clipboard.writeText(preRef.current.textContent!);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <pre
      ref={preRef}
      {...props}
      className={`group overflow relative m-0 h-full ${props.className ?? ""}`}
    >
      <button
        className={`sticky top-6 right-0 float-right opacity-0 pointer-events-none rounded border-2 p-1 after:absolute after:top-[50%] after:right-[130%] after:min-w-max after:translate-y-[-50%] after:rounded-sm after:bg-header-accent after:px-1 after:text-main after:text-sm after:opacity-0 after:shadow-md after:transition-opacity after:content-[attr(aria-label)] hover:after:scale-100 hover:after:opacity-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity ${copied ? "border-green-400" : "border-gray-300"}`}
        aria-label={`${copied ? "Copied" : "Copy"} to clipboard`}
        type="button"
        onClick={handleCopy}
      >
        {copied ? (
          <ClipboardCheckIcon className="h-6 w-6 stroke-green-400" />
        ) : (
          <ClipboardIcon className="h-6 w-6 stroke-gray-300" />
        )}
      </button>
      {children}
    </pre>
  );
}
