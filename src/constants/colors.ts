export const Colors = {
  // Primary palette
  primary: '#192443',
  primaryLight: '#243B61',
  primaryMuted: '#E8EDF5',

  // Accent
  accent: '#4C46C8',
  accentLight: '#EEEDFF',

  // Scientific purple
  science: '#5D507D',
  scienceLight: '#EEEAF4',

  // Backgrounds
  background: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFE',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#192443',
  textSecondary: '#58647B',
  textTertiary: '#647086',
  textOnDark: '#FFFFFF',

  // Score colors
  scoreExcellent: '#047857', // 8–10
  scoreGood: '#1D4ED8',      // 6–7
  scoreFair: '#B45309',      // 4–5
  scorePoor: '#B91C1C',      // 1–3

  // Severity colors
  severityLow: '#047857',
  severityModerate: '#B45309',
  severityHigh: '#B91C1C',
  severityCritical: '#7F1D1D',

  // Status colors
  success: '#047857',
  successLight: '#D1FAE5',
  warning: '#B45309',
  warningLight: '#FEF3C7',
  danger: '#B91C1C',
  dangerLight: '#FEE2E2',
  info: '#1D4ED8',
  infoLight: '#DBEAFE',

  // Badge colors by study design level
  cebmLevel1: '#059669', // systematic review — dark green
  cebmLevel2: '#047857', // RCT — green
  cebmLevel3: '#1D4ED8', // cohort — blue
  cebmLevel4: '#B45309', // case-control — amber
  cebmLevel5: '#B91C1C', // expert opinion — red

  // COI Status
  coiClear: '#047857',
  coiDeclared: '#B45309',
  coiFlagged: '#B91C1C',
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
