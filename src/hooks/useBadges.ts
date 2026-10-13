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
  { id: 'full_text', name: 'Source Reader', description: 'Appraise a paper using available full text', icon: 'document-text-outline', color: '#059669', target: 1 },
  { id: 'organizer', name: 'Organizer', description: 'Add a paper to a collection or tag it', icon: 'folder-open-outline', color: '#7C3AED', target: 1 },
  { id: 'rct_reader', name: 'Gold Standard', description: 'Analyze a Randomized Controlled Trial', icon: 'medal-outline', color: '#D97706', target: 1 },
  { id: 'meta_reader', name: 'Big Picture', description: 'Analyze a Systematic Review / Meta-Analysis', icon: 'layers-outline', color: '#2563EB', target: 1 },
  { id: 'streak_3', name: 'On a Roll', description: 'Analyze papers on 3 different days', icon: 'flame-outline', color: '#F97316', target: 3 },
];

export function useBadges(history: HistoryEntry[]): { badges: Badge[]; earned: number; total: number } {
  return useMemo(() => {
    const count = history.length;
    const hasFullText = history.some((h) => h.coverageLevel === 'full_text');
    const hasOrganized = history.some((h) => h.collection || h.tags?.length);
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
        case 'full_text': return hasFullText ? 1 : 0;
        case 'organizer': return hasOrganized ? 1 : 0;
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
