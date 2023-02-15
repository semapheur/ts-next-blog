import dynamic from 'next/dynamic'
import {compileMDX} from 'next-mdx-remote/rsc'
import fs from 'fs';
import path from 'path';

import { markdownHeadings, remarkPlugins, rehypePlugins } from 'utils/mdxParse';
import { mdxComponents } from 'utils/mdxComponents';
import Loader from 'components/Loader';

const Toc = dynamic(() => import('./Toc'), {
  ssr: false,
  loading: () => <div className='h-full flex justify-center'><Loader width='10%'/></div>
})

type Params = {
  subject: string,
  slug: string
}

type Props = {
  params: Params
}

export async function generateStaticParams() {
    const paths: Params[] = []

    const notesDir = path.join('content', 'notes');
    for (let subject of fs.readdirSync(notesDir)) {
      const subjectDir = path.join(notesDir, subject);
      for (let fileName of fs.readdirSync(subjectDir)) {
        const path ={
          subject: subject,
          slug: fileName.replace('.mdx', '')
        };
        paths.push(path);
      };
    };
    return paths;
}

async function getNote(subject: string, slug: string) {
  const mdx = fs.readFileSync(path.join('content', 'notes', subject, slug + '.mdx'), 'utf8');
  //const {data: metaData, content} = matter(note);
  //const mdxSource = await serializeMDX(content, metaData);

  const mdxHeadings = await markdownHeadings(mdx);

  return {
    source: mdx, 
    headings: mdxHeadings
  };
}

export default async function NotePage({params: {subject, slug}}: Props) {
  const {source, headings} = await getNote(subject, slug);
  
  const {content, frontmatter} = await compileMDX({
    source: source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        development: process.env.NODE_ENV !== 'production',
        remarkPlugins: remarkPlugins,
        // @ts-ignore
        rehypePlugins: rehypePlugins
      }
    },
    components: mdxComponents
  })

  return (
    <main className='grid grid-cols-[3fr_1fr] w-full bg-primary shadow-inner-l dark:shadow-black/50'>
      <div key={'div'} className='h-full flex justify-center overflow-y-scroll'>
        <article className='prose dark:prose-invert py-8'>
          <h1 className='text-center text-5xl font-extrabold'>
            {frontmatter?.title}
          </h1>
          {content}
        </article>
      </div>
      {frontmatter?.showToc && <Toc key={'toc'} headings={headings}/>}
    </main>
  )
}