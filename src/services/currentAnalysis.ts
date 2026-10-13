import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ArticleAnalysis } from '../types';

const CURRENT_ANALYSIS_KEY = '@medlit:current-analysis:v3';
let currentAnalysis: ArticleAnalysis | null = null;
let identityRevision = 0;
export function getIdentityRevision() { return identityRevision; }
export function invalidateIdentity() { identityRevision++; currentAnalysis = null; }

export async function purgeLegacyAnalysisCache(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_ANALYSIS_KEY);
}

export async function cacheCurrentAnalysis(analysis: ArticleAnalysis): Promise<void> {
  currentAnalysis = analysis;
  await purgeLegacyAnalysisCache().catch(() => {});
}

export async function loadCurrentAnalysis(id: string): Promise<ArticleAnalysis | null> {
  await purgeLegacyAnalysisCache().catch(() => {});
  return currentAnalysis?.id === id ? currentAnalysis : null;
}

export async function clearCurrentAnalysis(id?: string): Promise<void> {
  if (!id || currentAnalysis?.id === id) currentAnalysis = null;
  await purgeLegacyAnalysisCache().catch(() => {});
}
