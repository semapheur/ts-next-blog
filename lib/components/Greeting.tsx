"use client"

import { useEffect, useRef } from "react"

import { setAttributes } from "lib/utils/svg"

const words = new Map([
  ["english", "Hello"],
  ["french", "Bonjour"],
  ["spanish", "Hola"],
  ["italian", "Ciao"],
  ["portuguese", "Olá"],
  ["dutch", "Hoi"],
  ["frisian", "Goeie"],
  ["luxembourgish", "Moïen"],
  ["romanian", "Buna ziua"],
  ["romani", "Sastipe"],
  ["polish", "Cześć"],
  ["czech", "Nazdar"],
  ["slovak", "Ahoj"],
  ["slovenian", "Živjo"],
  ["croatian", "Bok"],
  ["bosnian", "Zdravo"],
  ["norwegian", "Hei"],
  ["danish", "Hej"],
  ["swedish", "Tjena"],
  ["finnish", "Terve"],
  ["latvian", "Sveiki"],
  ["lithuanian", "Labas"],
  ["estonian", "Tere"],
  ["hungarian", "Szervusz"],
  ["irish", "Dia dhuit"],
  ["russian", "Привет (Privet)"],
  ["belarussian", "Вітаю (Vitaju)"],
  ["ukrainian", "Привіт (Pryvit)"],
  ["serbian", "Здраво"],
  ["bulgarian", "Здравейте (Zdravejte)"],
  ["albanian", "Tungjatjeta "],
  ["greek", "Γειά σου (Yassou)"],
  ["maltese", "Ħellow"],
  ["armenian", "Բարև ձեզ (Barev dzez)"],
  ["georgian", "გამარჯობა (Gamarjoba)"],
  ["abkhaz", "Бзиа збаша (Bzia zbaşa)"],
  ["turkish", "Merhaba"],
  ["kurmanji", "Silav"],
  ["farsi", "(Dorud) درود"],
  ["dari", "(Salam) سلام"],
  ["kazakh", "Сәлем (Sälem)"],
  ["kyrgyz", "Саламатсызбы (Salamatsyzby)"],
  ["arabic", "(Marhaban) مرحبا"],
  ["urdu", "(Hello) ہیلو"],
  ["pashto", "(Khe chare) ښې چارې"],
  ["hebrew", "(Shalóm) שלום"],
  ["hindi", "नमस्ते (Namaste)"],
  ["japanese", "こんにちは (Konnichiwa)"],
  ["korean", "안녕하세요 (Annyeonghaseyo)"],
  ["mandarin", "你好 (Nǐ hǎo)"],
  ["cantonese", "你好 (Néih hóu)"],
  ["tibetan", "བཀྲ་ཤིས་བདེ་ལེགས། (Tashi delek)"],
  ["uyghur", "(Yaxshimusız) ياخشمۇسز"],
  ["vietnamese", "Xin chào"],
  ["khmer", "សួស្ (Sous-dey)"],
  ["lao", "ສະບາຍດີ (Sabaai-dii)"],
  ["thai", "สวัสดี (Sawasdee)"],
  ["filipino", "Kamusta"],
  ["tamil", "வணக்கம் (Vanakkam)"],
  ["telugu", "హలో (Halo)"],
  ["malayalam", "ഹലോ (Halea)"],
  ["bangla", "নমস্কার (Nomoshkar)"],
  ["marathi", "नमस्कार (Namaskara)"],
  ["maori", "Kia ora"],
  ["navajo", "Yá’át’ééh"],
  ["swahili", "Habari"],
  ["esperanto", "Saluton"],
  ["basque", "Kaixo"],
  ["hawaiian", "Aloha"],
  ["jamaican", "Hail up"],
  ["mongolian", "Сайн уу (Sain uu)"],
  ["latin", "Ave"],
  ["afrikaans", "Haai"],
  ["chamorro", "Håfå ådai"],
  ["cherokee", "ᎣᏏᏲ (Osiyo)"],
  ["choctaw", "Halito"],
  ["tsonga", "Xewani"],
  ["tswana", "Dumela"],
  ["tuvan", "Экии (Ekii)"],
])

function randomKey(obj: Map<string, string>) {
  const keys = Array.from(obj.keys())
  return keys[Math.floor(Math.random() * keys.length)]
}

function wrap(svgText: SVGTextElement, width: number) {
  const textWidth = svgText.getBBox().width

  if (textWidth < width) return

  const lineHeight = svgText.getBBox().height

  const words = svgText.textContent!.split(/(?<=\)?)\s(?=\)?)/)
  svgText.removeChild(svgText.firstChild!)

  for (let i = 0; i < words.length; i++) {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    )
    svgText.appendChild(tspan)
    setAttributes(tspan, { x: "50%", dy: `${i * lineHeight}px` })
    tspan.textContent = words[i]

    if (tspan.getBBox().width > width) {
      svgText.setAttribute("textLength", "90%")
    }
  }
}

export default function Greeting() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<SVGTextElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!textRef.current || !wrapRef.current) return

      textRef.current.textContent = words.get(randomKey(words))!
      wrap(textRef.current!, wrapRef.current!.getBoundingClientRect().width)
      textRef.current!.classList.add("animate-textstroke")

      setTimeout(() => {
        textRef.current?.classList.remove("animate-textstroke")
      }, 9100)
    }, 9500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="h-[7.5rem] md:h-60 flex justify-center items-center  
      bg-amber-100 dark:bg-stone-600"
    >
      <svg width="100%" height="100%">
        <title>Random greeting</title>
        <text
          ref={textRef}
          x="50%"
          y="40%"
          textAnchor="middle"
          strokeDasharray="0 50%"
          className="fill-transparent stroke-secondary stroke-[1.5] md:stroke-[3] 
          text-3xl md:text-7xl font-bold font-mono"
        />
      </svg>
    </div>
  )
}
