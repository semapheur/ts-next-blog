const stopwords = [
  "a", "about", "above", "after","again", "against", "all", "also", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "called", "can", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "due", "during", 
  "each", "evidently",
  "few", "for", "from", "further",
  "get",
  "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "hence", "her", "here", 
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "however", 
  "i", "i'd", "i'll", "i'm", "i've", "if", "iff", "imply", "implies", "implying", "in", "indeed", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let", "let's",
  "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not",
  "obviously", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "since", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "therefore", 
  "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "thus", "to", "too",
  "under", "until", "up",
  "very",
  "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", 
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
  'definition', 'example', 'proof', 'title',
  'boxtype', 'mathbox'
]

export default function tokenize(text: string): string[] {
  const re: RegExp[] = [
    /---\^+?---/gm,
    /\$\$?\^+?\$\$?/gm,
    /<\/?[a-z]+?>/g,
  ]

  // Cleanup string
  text = text.toLowerCase()
  for (const p of re) {
    text = text.replaceAll(p, '')
  }

  return text.split(/\W+/).filter((token) => (
    stopwords.indexOf(token) === -1 && token.length > 1)
  )
}