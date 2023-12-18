import type {NextApiRequest, NextApiResponse} from 'next';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import {serializeMDX} from 'utils/mdxParse';
import { MDXPost } from 'utils/types';

export default async function handler<T>(req: NextApiRequest, res: NextApiResponse<MDXPost<T>>) {

  const query = req.query.q!.toString(); //.split('/')

  const filePath = path.join(process.cwd(), 'content', 'notes', `${query}.mdx`);
  const post = fs.readFileSync(filePath)
  const {content} = matter(post);
  const result = await serializeMDX<T>(content) as MDXPost<T>;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
}
