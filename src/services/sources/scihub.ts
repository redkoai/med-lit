import { fetchViaProxy } from '../network';

export async function fetchFromSciHub(
  identifier: string,
  mirror: string
): Promise<string | null> {
  try {
    const url = `https://${mirror}/${identifier}`;
    const html = await fetchViaProxy(url);

    const abstractMatch = html.match(
      /<div[^>]*id="article"[^>]*>([\s\S]*?)<\/div>/i
    );
    if (abstractMatch) {
      return abstractMatch[1].replace(/<[^>]+>/g, ' ').trim();
    }
    return null;
  } catch {
    return null;
  }
}
