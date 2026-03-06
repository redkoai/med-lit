import type { ArticleAnalysis } from '../types';

/** Single responsibility: BibTeX citation generation only. */
export function generateBibTeX(analysis: ArticleAnalysis): string {
  const { article } = analysis;
  const year = article.year || new Date().getFullYear();
  const authors = article.authors.join(' and ');
  const key = `${article.authors[0]?.split(' ').pop() || 'unknown'}${year}`;

  return `@article{${key},
  title = {${article.title}},
  author = {${authors}},
  journal = {${article.journal}},
  year = {${year}},${article.volume ? `\n  volume = {${article.volume}},` : ''}${article.issue ? `\n  issue = {${article.issue}},` : ''}${article.pages ? `\n  pages = {${article.pages}},` : ''}${article.doi ? `\n  doi = {${article.doi}},` : ''}${article.pmid ? `\n  pmid = {${article.pmid}},` : ''}
  note = {MedLit Analysis: Accuracy ${analysis.accuracyScore.score}/10, Bias ${analysis.biasScore.score}/10}
}`;
}
