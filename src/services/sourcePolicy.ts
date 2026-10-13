export const ALLOWED_SOURCE_HOSTS = [
  'ncbi.nlm.nih.gov',
  'pubmed.ncbi.nlm.nih.gov',
  'pmc.ncbi.nlm.nih.gov',
  'eutils.ncbi.nlm.nih.gov',
  'ebi.ac.uk',
  'europepmc.org',
  'api.crossref.org',
  'api.unpaywall.org',
  'doi.org',
  'nature.com',
  'nejm.org',
  'thelancet.com',
  'jamanetwork.com',
  'biorxiv.org',
  'medrxiv.org',
  'arxiv.org',
  'springer.com',
  'biomedcentral.com',
] as const;

export function isAllowedSourceUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    return ALLOWED_SOURCE_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export function sourceHost(raw: string): string {
  try {
    return new URL(raw).hostname;
  } catch {
    return 'invalid';
  }
}

/** Follow redirects only after validating every destination against the source allowlist. */
export async function fetchAllowedSource(
  raw: string,
  init: RequestInit,
  maxRedirects = 4,
): Promise<Response> {
  if (!isAllowedSourceUrl(raw)) throw new Error('Unsupported source URL');
  let current = raw;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetch(current, { ...init, redirect: 'manual' });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    if (!location) throw new Error('Source redirect was missing a destination');
    const next = new URL(location, current).toString();
    if (!isAllowedSourceUrl(next)) throw new Error('Source redirect left the allowlist');
    current = next;
  }
  throw new Error('Source exceeded the redirect limit');
}
