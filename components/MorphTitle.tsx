'use client'

import {useEffect, useRef} from 'react'

const words = new Map([
  ['english', 'Hello'], 
  ['french', 'Bonjour'], 
  ['spanish', 'Hola'],
  ['italian', 'Ciao'], 
  ['portuguese', 'Olá'],
  ['dutch', 'Hoi'],
  ['frisian', 'Goeie'],
  ['luxembourgish', 'Moïen'],
  ['romanian', 'Buna ziua'],
  ['romani', 'Sastipe'],
  ['polish', 'Cześć'],
  ['czech', 'Nazdar'],
  ['slovak', 'Ahoj'],
  ['slovenian', 'Živjo'],
  ['croatian', 'Bok'],
  ['bosnian', 'Zdravo'], 
  ['norwegian', 'Hei'],
  ['danish', 'Hej'],
  ['swedish', 'Tjena'],
  ['finnish', 'Terve'],
  ['latvian', 'Sveiki'],
  ['lithuanian', 'Labas'],
  ['estonian', 'Tere'],
  ['hungarian', 'Szervusz'],
  ['irish', 'Dia dhuit'],
  ['russian', 'Привет (Privet)'],
  ['belarussian', 'Вітаю (Vitaju)'],
  ['ukrainian', 'Привіт (Pryvit)'],
  ['serbian', 'Здраво'],
  ['bulgarian', 'Здравейте (Zdravejte)'],
  ['albanian', 'Tungjatjeta '],
  ['greek', 'Γειά σου (Yassou)'],
  ['maltese', 'Ħellow'],
  ['armenian', 'Բարև ձեզ (Barev dzez)'],
  ['georgian', 'გამარჯობა (Gamarjoba)'],
  ['abkhaz', 'Бзиа збаша (Bzia zbaşa)'],
  ['turkish', 'Merhaba'],
  ['kurmanji', 'Silav'],
  ['farsi', '(Dorud) درود'],
  ['dari', '(Salam) سلام' ],
  ['kazakh', 'Сәлем (Sälem)'],
  ['kyrgyz', 'Саламатсызбы (Salamatsyzby)'],
  ['arabic', '(Marhaban) مرحبا'],
  ['urdu', '(Hello) ہیلو'],
  ['pashto', '(Khe chare) ښې چارې'],
  ['hebrew', '(Shalóm) שלום'],
  ['hindi', 'नमस्ते (Namaste)'],
  ['japanese', 'こんにちは (Konnichiwa)'],
  ['korean', '안녕하세요 (Annyeonghaseyo)'],
  ['mandarin', '你好 (Nǐ hǎo)'],
  ['cantonese', '你好 (Néih hóu)'],
  ['tibetan', 'བཀྲ་ཤིས་བདེ་ལེགས། (Tashi delek)'],
  ['uyghur', '(Yaxshimusız) ياخشىمۇسىز'],
  ['vietnamese', 'Xin chào'],
  ['khmer', 'សួស្ (Sous-dey)'],
  ['lao', 'ສະບາຍດີ (Sabaai-dii)'],
  ['thai', 'สวัสดี (Sawasdee)'],
  ['filipino', 'Kamusta'],
  ['tamil', 'வணக்கம் (Vanakkam)'],
  ['telugu', 'హలో (Halo)'],
  ['malayalam', 'ഹലോ (Halea)'],
  ['bangla', 'নমস্কার (Nomoshkar)'],
  ['marathi', 'नमस्कार (Namaskara)'],
  ['maori', 'Kia ora'],
  ['navajo', 'Yá’át’ééh'],
  ['swahili', 'Habari'],
  ['esperanto', 'Saluton'],
  ['basque', 'Kaixo'],
  ['hawaiian', 'Aloha'],
  ['jamaican', 'Hail up'],
  ['mongolian', 'Сайн уу (Sain uu)'],
  ['latin', 'Ave'],
  ['afrikaans', 'Haai'],
  ['chamorro', 'Håfå ådai'],
  ['cherokee', 'ᎣᏏᏲ (Osiyo)'],
  ['choctaw', 'Halito'],
  ['tsonga', 'Xewani'],
  ['tswana', 'Dumela'],
])

const randomKey = (obj: Map<string, string>) => {
    const keys = Array.from(obj.keys())
    return keys[Math.floor(Math.random() * keys.length)]
} 

export default function MorphTitle() {
  const currentRef = useRef<HTMLSpanElement>()

  useEffect(() => {
    const currentText = currentRef?.current

    currentText.textContent = words.get(randomKey(words))

    const timeout = setInterval(() => {
      currentText.classList.toggle('animate-morph')

      setTimeout(() => {
          currentText.textContent = words.get(randomKey(words))
      }, 250)
      setTimeout(() => {
          currentText.classList.toggle('animate-morph')
      }, 1000)
    }, 10000)

    return () => clearInterval(timeout)
  }, [])

  return (
    <div className='flex justify-center items-center filter blur-[0.5px] 
      pb-[4.5rem] bg-amber-100 dark:bg-stone-600'
    >
      <span className='text-7xl text-secondary' ref={currentRef}/>
    </div>
  )
}