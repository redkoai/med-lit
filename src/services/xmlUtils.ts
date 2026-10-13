/**
 * XML parsing helpers for article fetcher sources.
 * Single responsibility: XML text/array extraction only.
 */

import type { ArticleReference } from '../types';

export function decodeXmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const hex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

export function stripXml(value: string): string {
  return decodeXmlEntities(
    value
      .replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, '^$1')
      .replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, '_$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export function parseXmlText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? stripXml(m[1]) : '';
}

export function parseXmlArray(xml: string, tag: string): string[] {
  const results: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const text = stripXml(m[1]);
    if (text) results.push(text);
  }
  return results;
}

function referenceFromXml(block: string): ArticleReference | null {
  const raw = stripXml(block);
  if (!raw) return null;
  const doiTag = Array.from(block.matchAll(/<pub-id\b([^>]*)>([\s\S]*?)<\/pub-id>/gi))
    .find((match) => /pub-id-type=["']doi["']/i.test(match[1]));
  const doi = doiTag
    ? stripXml(doiTag[2])
    : raw.match(/10\.\d{4,9}\/[^\s,;]+/i)?.[0]?.replace(/[.)]+$/, '');
  const pmidMatch = block.match(/<pub-id[^>]*pub-id-type=["']pmid["'][^>]*>([^<]+)<\/pub-id>/i);
  return {
    raw,
    doi: doi && doi.startsWith('10.') ? doi : undefined,
    pmid: pmidMatch?.[1]?.trim(),
    identifierStatus: 'not_checked',
    retractionStatus: 'not_checked',
  };
}

export function parseJatsDocument(xml: string): {
  fullText?: string;
  references: ArticleReference[];
  availableSections: string[];
} {
  const body = xml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const availableSections = new Set<string>();
  const sections: string[] = [];
  const sectionRe = /<sec\b[^>]*>([\s\S]*?)<\/sec>/gi;
  let sectionMatch: RegExpExecArray | null;
  while ((sectionMatch = sectionRe.exec(body)) !== null) {
    const block = sectionMatch[1];
    const title = parseXmlText(block, 'title') || 'Section';
    const normalizedTitle = title.toLowerCase();
    if (/method|material|participant|procedure/.test(normalizedTitle)) availableSections.add('methods');
    if (/result|finding/.test(normalizedTitle)) availableSections.add('results');
    if (/discussion|conclusion/.test(normalizedTitle)) availableSections.add('discussion');
    const paragraphs = parseXmlArray(block, 'p');
    if (paragraphs.length) sections.push(`## ${title}\n${paragraphs.join('\n\n')}`);
  }

  const abstractBlocks = parseXmlArray(xml, 'abstract');
  if (abstractBlocks.length) availableSections.add('abstract');
  if (/<funding-group\b|<funding-statement\b/i.test(xml)) availableSections.add('funding');
  if (/<conflict-of-interest\b|<fn[^>]+fn-type=["']conflict["']/i.test(xml)) availableSections.add('conflicts');

  const references: ArticleReference[] = [];
  const refList = xml.match(/<ref-list\b[^>]*>([\s\S]*?)<\/ref-list>/i)?.[1] ?? '';
  const refRe = /<ref\b[^>]*>([\s\S]*?)<\/ref>/gi;
  let refMatch: RegExpExecArray | null;
  while ((refMatch = refRe.exec(refList)) !== null && references.length < 500) {
    const reference = referenceFromXml(refMatch[1]);
    if (reference) references.push(reference);
  }
  if (references.length) availableSections.add('references');

  const fallbackText = body
    ? body
      .replace(/<title[^>]*>([\s\S]*?)<\/title>/gi, (_match, title: string) => `\n## ${stripXml(title)}\n`)
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, paragraph: string) => `\n${stripXml(paragraph)}\n`)
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
    : '';
  const fullText = sections.join('\n\n').trim() || decodeXmlEntities(fallbackText);
  return {
    fullText: fullText.length > 300 ? fullText : undefined,
    references,
    availableSections: [...availableSections],
  };
}
