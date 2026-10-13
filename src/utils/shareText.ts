import { Platform, Share } from 'react-native';

/** User-initiated text export. Desktop browsers need a download fallback. */
export async function shareText(message: string, filename = 'medlit-report.txt'): Promise<string> {
  if (Platform.OS !== 'web') {
    await Share.share({ message });
    return 'Share sheet opened.';
  }
  const url = URL.createObjectURL(new Blob([message], { type: 'text/plain;charset=utf-8' }));
  try {
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
  } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return `Downloaded ${filename}.`;
}
