import type {NextApiRequest, NextApiResponse} from 'next';

import {XorFilter} from 'bloom-filters'

import tokenize from 'utils/tokenize'
import {notes} from 'cache/note'

export type SearchResult = {
	score: number;
	slug: string;
	title: string;
}[]

//const notes: Note[] = process.env.NODE_ENV === 'production' ? 
//	require('cache/note').notes : await indexNotes(); //cachedNotes as Note[];

export default async function handler(req: NextApiRequest, res: NextApiResponse<SearchResult>) {

	const query = tokenize(req.query.q!.toString())

	let result: SearchResult = [];
	let score = 0;
	for (const note of notes) {
		score = query.filter(q => note.title.toLowerCase().includes(q)).length;

		const xor8 = XorFilter.fromJSON(JSON.parse(JSON.stringify(note.filter))) as XorFilter;
		query.forEach(q => {
			if (xor8.has(q)) score++
		})

		if (score > 0) {
			result.push({
				score: score,
				slug: note.slug,
				title: note.title
			})
		}
	}
	// Sort search result
	if (result.length) {
		result = result.sort((a, b) => b.score - a.score)
	}

	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.json(result);
}
