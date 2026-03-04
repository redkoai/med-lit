export const Colors = {
  // Primary palette
  primary: '#0F2E4E',
  primaryLight: '#1A4470',
  primaryMuted: '#E8F0F9',

  // Accent
  accent: '#4F8EF7',
  accentLight: '#EBF2FF',

  // Scientific purple
  science: '#7C3AED',
  scienceLight: '#EDE9FE',

  // Backgrounds
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFE',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnDark: '#FFFFFF',

  // Score colors
  scoreExcellent: '#10B981', // 8–10
  scoreGood: '#3B82F6',      // 6–7
  scoreFair: '#F59E0B',      // 4–5
  scorePoor: '#EF4444',      // 1–3

  // Severity colors
  severityLow: '#10B981',
  severityModerate: '#F59E0B',
  severityHigh: '#EF4444',
  severityCritical: '#7F1D1D',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Badge colors by study design level
  cebmLevel1: '#059669', // systematic review — dark green
  cebmLevel2: '#10B981', // RCT — green
  cebmLevel3: '#3B82F6', // cohort — blue
  cebmLevel4: '#F59E0B', // case-control — amber
  cebmLevel5: '#EF4444', // expert opinion — red

  // COI Status
  coiClear: '#10B981',
  coiDeclared: '#F59E0B',
  coiFlagged: '#EF4444',
  coiMissing: '#6B7280',
} as const;

export type ColorKey = keyof typeof Colors;

export function getScoreColor(score: number): string {
  if (score >= 8) return Colors.scoreExcellent;
  if (score >= 6) return Colors.scoreGood;
  if (score >= 4) return Colors.scoreFair;
  return Colors.scorePoor;
}

export function getSeverityColor(severity: 'low' | 'moderate' | 'high' | 'critical'): string {
  switch (severity) {
    case 'low': return Colors.severityLow;
    case 'moderate': return Colors.severityModerate;
    case 'high': return Colors.severityHigh;
    case 'critical': return Colors.severityCritical;
  }
}

export function getCEBMColor(level: number): string {
  switch (level) {
    case 1: return Colors.cebmLevel1;
    case 2: return Colors.cebmLevel2;
    case 3: return Colors.cebmLevel3;
    case 4: return Colors.cebmLevel4;
    default: return Colors.cebmLevel5;
  }
}
