import { fetchWithTimeout } from '../network';

const UNPAYWALL_BASE = 'https://api.unpaywall.org/v2';

export async function fetchOpenAccessUrl(
  doi: string,
  email: string
): Promise<string | null> {
  try {
    const url = `${UNPAYWALL_BASE}/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.is_oa) return null;

    const loc = data.best_oa_location;
    return loc?.url_for_pdf || loc?.url || null;
  } catch {
    return null;
  }
}
