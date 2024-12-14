import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { compileMDX } from "next-mdx-remote/rsc"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import { remarkPlugins, rehypePlugins } from "lib/utils/mdxParse"
import { markdownHeadings } from "lib/utils/mdParse"
import { mdxComponents } from "lib/utils/mdxComponents"
import Loader from "lib/components/Loader"
import type { NoteHeading } from "lib/utils/types"
import type { MDXProps } from "mdx/types"

const Toc = dynamic(() => import("./Toc"), {
  loading: () => (
    <div
      className="z-[1] w-10 h-10 lg:w-full lg:h-full 
      absolute lg:static top-[10%] right-0 lg:z-auto
      grid place-items-center cursor-pointer lg:hidden
      bg-primary/50 backdrop-blur-sm lg:backdrop-blur-none
      -mr-2 pr-1 lg:mr-0 lg:pr-0 rounded-l-full lg:rounded-none
      shadow-tlb dark:shadow-black/50 lg:shadow-none"
    >
      <Loader width="75%" />
    </div>
  ),
})

type Params = {
  subject: string
  slug: string
}

type Props = {
  params: Promise<Params>
}

const MDXOptions = (noCite: string[] = []) => {
  return {
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        development: process.env.NODE_ENV !== "production",
        remarkPlugins: remarkPlugins,
        rehypePlugins: rehypePlugins(noCite),
      },
    },
    components: mdxComponents,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, slug } = await params
  const { source, headings } = await getNote(subject, slug)

  const frontmatter = matter(source)
  const result: string[] = []

  const callback = (h: NoteHeading) => {
    result.push(h.text)
    h.children?.forEach(callback)
  }
  headings.forEach(callback)

  return {
    title: frontmatter.data.title,
    description: result.join(";"),
  }
}

export async function generateStaticParams() {
  const paths: Params[] = []

  const notesDir = path.join("content", "notes")
  for (const subject of fs.readdirSync(notesDir)) {
    const subjectDir = path.join(notesDir, subject)
    for (const fileName of fs.readdirSync(subjectDir)) {
      const path = {
        subject: subject,
        slug: fileName.replace(".mdx", ""),
      }
      paths.push(path)
    }
  }
  return paths
}

async function getNote(subject: string, slug: string) {
  const source = fs.readFileSync(
    path.join("content", "notes", subject, `${slug}.mdx`),
    "utf8",
  )
  const headings = await markdownHeadings(source)

  return { source, headings }
}

export default async function NotePage({ params }: Props) {
  const { subject, slug } = await params
  const { source, headings } = await getNote(subject, slug)
  const frontmatter = matter(source)
  const { content } = await compileMDX({
    source: source,
    ...(MDXOptions(frontmatter.data.references) as MDXProps),
  })

  return (
    <main
      className="relative grid grid-cols-[1fr_auto] h-full w-full overflow-y-clip 
      bg-primary shadow-inner-l dark:shadow-black/50"
    >
      <>
        <div
          key="div.note"
          className="h-full flex justify-center overflow-y-scroll"
        >
          <article
            className="max-w-full md:max-w-read
            prose prose-stone prose-sm md:prose-base dark:prose-invert 
            py-8 px-2 md:px-0"
          >
            <h1 className="text-center text-5xl font-extrabold">
              {frontmatter.data.title}
            </h1>
            {content}
          </article>
        </div>
        {frontmatter.data.showToc && <Toc key="toc.note" headings={headings} />}
      </>
    </main>
  )
}
