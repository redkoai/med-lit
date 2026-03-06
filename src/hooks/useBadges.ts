import { useMemo } from 'react';
import type { HistoryEntry } from '../types';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons name
  color: string;
  earned: boolean;
  progress: number; // 0–1
  target: number;
  current: number;
}

const BADGE_DEFS: Omit<Badge, 'earned' | 'progress' | 'current'>[] = [
  { id: 'first_analysis', name: 'First Steps', description: 'Analyze your first paper', icon: 'rocket-outline', color: '#4F8EF7', target: 1 },
  { id: 'five_analyses', name: 'Getting Serious', description: 'Analyze 5 papers', icon: 'flask-outline', color: '#7C3AED', target: 5 },
  { id: 'ten_analyses', name: 'Literature Pro', description: 'Analyze 10 papers', icon: 'school-outline', color: '#10B981', target: 10 },
  { id: 'twenty_five', name: 'Research Machine', description: 'Analyze 25 papers', icon: 'hardware-chip-outline', color: '#F59E0B', target: 25 },
  { id: 'fifty_analyses', name: 'Scholar Elite', description: 'Analyze 50 papers', icon: 'trophy-outline', color: '#EF4444', target: 50 },
  { id: 'high_accuracy', name: 'Sharp Eye', description: 'Find a paper scoring 9+ accuracy', icon: 'eye-outline', color: '#059669', target: 1 },
  { id: 'low_bias', name: 'Bias Hunter', description: 'Find a paper with high bias risk', icon: 'warning-outline', color: '#DC2626', target: 1 },
  { id: 'rct_reader', name: 'Gold Standard', description: 'Analyze a Randomized Controlled Trial', icon: 'medal-outline', color: '#D97706', target: 1 },
  { id: 'meta_reader', name: 'Big Picture', description: 'Analyze a Systematic Review / Meta-Analysis', icon: 'layers-outline', color: '#2563EB', target: 1 },
  { id: 'streak_3', name: 'On a Roll', description: 'Analyze papers on 3 different days', icon: 'flame-outline', color: '#F97316', target: 3 },
];

export function useBadges(history: HistoryEntry[]): { badges: Badge[]; earned: number; total: number } {
  return useMemo(() => {
    const count = history.length;
    const highAccuracy = history.some((h) => h.accuracyScore >= 9);
    const highBias = history.some((h) => h.biasScore <= 3);
    const hasRCT = history.some((h) => h.studyDesign?.includes('Randomized'));
    const hasMeta = history.some((h) => h.studyDesign?.includes('Systematic') || h.studyDesign?.includes('Meta'));

    const uniqueDays = new Set(history.map((h) => h.analyzedAt?.slice(0, 10))).size;

    function getCurrent(id: string): number {
      switch (id) {
        case 'first_analysis': return Math.min(count, 1);
        case 'five_analyses': return Math.min(count, 5);
        case 'ten_analyses': return Math.min(count, 10);
        case 'twenty_five': return Math.min(count, 25);
        case 'fifty_analyses': return Math.min(count, 50);
        case 'high_accuracy': return highAccuracy ? 1 : 0;
        case 'low_bias': return highBias ? 1 : 0;
        case 'rct_reader': return hasRCT ? 1 : 0;
        case 'meta_reader': return hasMeta ? 1 : 0;
        case 'streak_3': return Math.min(uniqueDays, 3);
        default: return 0;
      }
    }

    const badges: Badge[] = BADGE_DEFS.map((def) => {
      const current = getCurrent(def.id);
      return {
        ...def,
        current,
        earned: current >= def.target,
        progress: Math.min(current / def.target, 1),
      };
    });

    const earned = badges.filter((b) => b.earned).length;
    return { badges, earned, total: badges.length };
  }, [history]);
}
