import type { ArticleAnalysis } from '../types';

const bibtexEscape = (value: string) => value
  .replace(/\\/g, '\\textbackslash{}')
  .replace(/([{}#$%&_])/g, '\\$1');

function citationKey(analysis: ArticleAnalysis): string {
  const firstAuthor = analysis.article.authors[0]?.split(/[\s,]+/)[0] || 'unknown';
  const year = analysis.article.year?.toString() ?? 'undated';
  const titleWord = analysis.article.title.match(/[A-Za-z0-9]{4,}/)?.[0] ?? 'article';
  return `${firstAuthor}${year}${titleWord}`.replace(/[^A-Za-z0-9_-]/g, '');
}

/** Generate a BibTeX record for the article, with appraisal provenance in note. */
export function generateBibTeX(analysis: ArticleAnalysis): string {
  const { article } = analysis;
  const fields = [
    `  title = {${bibtexEscape(article.title)}}`,
    `  author = {${bibtexEscape(article.authors.join(' and '))}}`,
    `  journal = {${bibtexEscape(article.journal)}}`,
    article.year ? `  year = {${article.year}}` : undefined,
    article.volume ? `  volume = {${bibtexEscape(article.volume)}}` : undefined,
    article.issue ? `  number = {${bibtexEscape(article.issue)}}` : undefined,
    article.pages ? `  pages = {${bibtexEscape(article.pages)}}` : undefined,
    article.doi ? `  doi = {${bibtexEscape(article.doi)}}` : undefined,
    article.pmid ? `  pmid = {${bibtexEscape(article.pmid)}}` : undefined,
    `  note = {MedLit appraisal ${bibtexEscape(analysis.analysisVersion)}; confidence ${analysis.verdict.confidence}; source coverage ${analysis.appraisal.sourceCoverage.level.replace('_', ' ')}}`,
  ].filter((field): field is string => Boolean(field));

  return `@article{${citationKey(analysis)},\n${fields.join(',\n')}\n}`;
}
