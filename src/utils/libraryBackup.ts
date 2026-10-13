import type { ArticleAnalysis } from '../types';

export interface LibraryBackup {
  schema: 'medlit-library-backup-v1';
  exportedAt: string;
  analyses: ArticleAnalysis[];
}

export function createLibraryBackup(analyses: ArticleAnalysis[]): LibraryBackup {
  return {
    schema: 'medlit-library-backup-v1',
    exportedAt: new Date().toISOString(),
    analyses,
  };
}

export async function exportLibraryBackup(analyses: ArticleAnalysis[]): Promise<void> {
  const { Platform, Share } = await import('react-native');
  const json = JSON.stringify(createLibraryBackup(analyses), null, 2);
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medlit-library-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ message: json, title: 'MedLit library backup' });
}
