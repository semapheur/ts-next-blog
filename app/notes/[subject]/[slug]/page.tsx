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
    <div className="-mr-2 absolute top-[10%] right-0 z-[1] grid h-10 w-10 cursor-pointer place-items-center rounded-l-full bg-primary/50 pr-1 shadow-tlb backdrop-blur-sm lg:static lg:z-auto lg:mr-0 lg:hidden lg:h-full lg:w-full lg:rounded-none lg:pr-0 lg:shadow-none lg:backdrop-blur-none dark:shadow-black/50">
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
    <main className="relative h-full w-full overflow-y-clip bg-primary shadow-inner-l lg:grid lg:grid-cols-[3fr_1fr] dark:shadow-black/50">
      <>
        <div
          key="div.note"
          className="@container flex h-full justify-center overflow-y-scroll"
        >
          <article className="prose prose-stone prose-sm md:prose-base dark:prose-invert @md:max-w-read @xl:max-w-3xl max-w-full px-2 py-8">
            <h1 className="text-center font-extrabold text-5xl">
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
