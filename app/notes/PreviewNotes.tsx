'use client'

import useSWR, {Fetcher} from 'swr';

import MDXContent from 'components/MDXContent';
import Loader from 'components/Loader';
import { MDXPost, NoteMatter } from 'utils/types';

const previewFetcher: Fetcher<MDXPost<NoteMatter>, string> = async (slug) => {
  const res = await fetch(`/api/getnotecontent?q=${slug}`).then(res => res.json());
  return res;
}

type Props = {
  slug: string
}

export default function Preview({slug}: Props) {

  const {data, isLoading} = useSWR(slug, previewFetcher)
  if (isLoading) return <Loader width='2.5rem'/>;

  if (!data) return <></>

  return (
    <article className='prose prose-sm dark:prose-invert py-8'>
      <h1 className='text-center text-5xl font-extrabold'>
        {data.frontmatter.title}
      </h1>
      <MDXContent source={data.serialized}/>
    </article>
  )
}