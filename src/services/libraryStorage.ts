import type { ArticleAnalysis } from '../types';

export const libraryKey = (uid?: string | null) => uid ? `@medlit:analyses:v4:user:${uid}` : '@medlit:analyses:v3';
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
const queues = new Map<string, Promise<unknown>>();
const listeners = new Set<(key: string) => void>();
export function subscribeLibrary(listener: (key: string) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export async function readLibrary(storage: Storage, uid?: string | null): Promise<ArticleAnalysis[]> {
  const raw = await storage.getItem(libraryKey(uid));
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('The saved library could not be read. Export a backup before clearing storage.');
  return parsed.filter(item => item?.id && item?.article && item?.appraisal && item?.verdict && item?.evidenceScore);
}
/** Serialize read-modify-write operations per account, including concurrent imports. */
export async function updateLibrary(storage: Storage, uid: string | null | undefined, change: (items: ArticleAnalysis[]) => ArticleAnalysis[]): Promise<ArticleAnalysis[]> {
  const key = libraryKey(uid);
  const task = (queues.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
    const next = change(await readLibrary(storage, uid)).sort((a, b) => b.analyzedAt.localeCompare(a.analyzedAt)).slice(0, 100);
    await storage.setItem(key, JSON.stringify(next));
    listeners.forEach(listener => listener(key));
    return next;
  });
  queues.set(key, task);
  try { return await task; } finally { if (queues.get(key) === task) queues.delete(key); }
}
