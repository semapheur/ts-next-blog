import Link from "next/link"

type AppContent = {
  title: string,
  description: string,
  slug: string
}

type Props = {
  content: AppContent
}

export default function AppCard({content}: Props) {
  return (
    <Link href={content.slug}
      className='h-full w-full p-4 flex flex-col absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-transparent z-[1]'
    >
      <h3 
        className='mt-4 text-lg font-semibold text-text'
      >
        {content.title}
      </h3>
      <p key='p' className='mt-4 text-sm text-text'>
        {content.description}
      </p>
    </Link>
  )
}