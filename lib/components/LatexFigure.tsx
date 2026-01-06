"use client";

import { LatexIcon } from "lib/utils/icons";
import dynamic from "next/dynamic";
import { useState } from "react";

const Modal = dynamic(() => import("lib/components/LatexModal"), {
  ssr: false,
}); //import Modal from 'lib/components/Modal'

interface Props {
  width?: number;
  src: string;
  alt?: string;
  caption: string;
  children: string;
  tag?: string;
}

export default function LatexFigure({
  width = 70,
  src,
  alt,
  caption,
  children,
  tag,
}: Props) {
  const [isHovered, setHover] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  if (!alt) {
    alt = src.match(/(?<=\/)\w+(?=.(svg|png|gif))/)![0];
  }

  return (
    <figure
      id={tag}
      className="relative flex flex-col"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => {}}
    >
      <img
        className="mx-auto mb-0 bg-white"
        alt={alt}
        src={src}
        width={`${width}%`}
      />
      <figcaption className="text-center before:font-bold before:content-['Figure_'_counter(figure)_':_'] before:[counter-increment:figure]">
        {caption}
      </figcaption>
      {isHovered && (
        <button
          className="-top-10 -translate-x-1/2 absolute left-1/2"
          type="button"
          onClick={() => setShowModal(true)}
        >
          <LatexIcon
            className="h-12 w-12 cursor-pointer"
            color="rgb(var(--color-text)/1)"
          />
        </button>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(!showModal)}>
        {children}
      </Modal>
    </figure>
  );
}
