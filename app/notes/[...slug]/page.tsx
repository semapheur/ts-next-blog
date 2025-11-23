import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Loader from "lib/components/Loader";
import MathPopover from "lib/components/MathPopover";
import { PopoverContextProvider } from "lib/components/PopoverContext";
import { markdownHeadings } from "lib/utils/mdParse";
import { mdxComponents } from "lib/utils/mdxComponents";
import { rehypePlugins, remarkPlugins } from "lib/utils/mdxParse";
import type { NoteHeading } from "lib/utils/types";
import type { MDXProps } from "mdx/types";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { compileMDX } from "next-mdx-remote/rsc";

const Toc = dynamic(() => import("./Toc"), {
  loading: () => (
    <div className="-mr-2 absolute top-[10%] right-0 z-1 grid h-10 w-10 cursor-pointer place-items-center rounded-l-full bg-primary/50 pr-1 shadow-tlb backdrop-blur-xs lg:static lg:z-auto lg:mr-0 lg:hidden lg:h-full lg:w-full lg:rounded-none lg:pr-0 lg:shadow-none lg:backdrop-blur-none dark:shadow-black/50">
      <Loader width="75%" />
    </div>
  ),
});

interface Params {
  slug: string[];
}

interface Props {
  params: Promise<Params>;
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
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { source, headings } = await getNote(slug);

  const frontmatter = matter(source);
  const result: string[] = [];

  const callback = (h: NoteHeading) => {
    result.push(h.text);
    h.children?.forEach(callback);
  };
  headings.forEach(callback);

  return {
    title: frontmatter.data.title,
    description: result.join(";"),
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  const paths: Params[] = [];
  const notesDir = path.join(process.cwd(), "content", "notes");

  function walkDir(currentDir: string) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);

      if (item.isDirectory()) {
        walkDir(fullPath);
      } else if (item.isFile() && item.name.endsWith(".mdx")) {
        const relativePath = path
          .relative(notesDir, fullPath)
          .replace(/\.mdx$/, "");
        const slug = relativePath.split(path.sep);
        paths.push({ slug });
      }
    }
  }

  walkDir(notesDir);
  return paths;
}

async function getNote(slug: string[]) {
  slug[slug.length - 1] += ".mdx";
  const notePath = path.join("content", "notes", ...slug);
  const source = fs.readFileSync(notePath, "utf8");
  const headings = await markdownHeadings(source);

  return { source, headings };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const { source, headings } = await getNote(slug);
  const frontmatter = matter(source);
  const { content } = await compileMDX({
    source: source,
    ...(MDXOptions(frontmatter.data.references) as MDXProps),
  });

  return (
    <main className="relative h-full w-full overflow-y-clip bg-primary shadow-inner-l lg:grid lg:grid-cols-[3fr_1fr] dark:shadow-black/50">
      <div
        key="div.note"
        className="@container flex h-full justify-center overflow-y-scroll"
      >
        <article className="prose prose-stone prose-sm md:prose-base dark:prose-invert @md:max-w-read @xl:max-w-3xl max-w-full px-2 py-8">
          <h1 className="text-center font-extrabold text-5xl">
            {frontmatter.data.title}
          </h1>
          <PopoverContextProvider>
            {content}
            <MathPopover />
          </PopoverContextProvider>
        </article>
      </div>
      {frontmatter.data.showToc && <Toc key="toc.note" headings={headings} />}
    </main>
  );
}
