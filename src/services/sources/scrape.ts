import { fetchViaProxy } from '../network';

export async function scrapeAbstractFromPage(url: string): Promise<{
  abstract?: string;
  doi?: string;
  title?: string;
} | null> {
  try {
    const html = await fetchViaProxy(url);

    const doiMatch =
      html.match(/name="citation_doi"\s+content="([^"]+)"/i) ||
      html.match(/property="citation_doi"\s+content="([^"]+)"/i) ||
      html.match(/name="DC\.Identifier"\s+content="([^"]+)"/i);

    const abstractMatch =
      html.match(/name="citation_abstract"\s+content="([^"]+)"/i) ||
      html.match(/name="description"\s+content="([^"]+)"/i) ||
      html.match(/class="abstract[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section|p)>/i);

    const titleMatch =
      html.match(/name="citation_title"\s+content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    return {
      doi: doiMatch?.[1]?.replace(/^https?:\/\/doi\.org\//i, '').trim(),
      abstract: abstractMatch?.[1]?.replace(/<[^>]+>/g, '').trim(),
      title: titleMatch?.[1]?.trim(),
    };
  } catch {
    return null;
  }
}
