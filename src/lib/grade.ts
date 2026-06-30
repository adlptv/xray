/**
 * Grade calculation utilities for XRay security analysis.
 * Grades: A (best) through F (worst)
 */

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface GradeBreakdown {
  overall: Grade;
  permissions: Grade;
  network: Grade;
  contentScripts: Grade;
  exfiltration: Grade;
  manifest: Grade;
}

interface RiskFactors {
  permissionScore: number;
  networkScore: number;
  contentScriptScore: number;
  exfiltrationScore: number;
  manifestScore: number;
}

const GRADE_THRESHOLDS: Array<{ grade: Grade; max: number }> = [
  { grade: 'A', max: 10 },
  { grade: 'B', max: 20 },
  { grade: 'C', max: 35 },
  { grade: 'D', max: 50 },
  { grade: 'E', max: 70 },
  { grade: 'F', max: 100 },
];

export function scoreToGrade(score: number): Grade {
  for (const { grade, max } of GRADE_THRESHOLDS) {
    if (score <= max) return grade;
  }
  return 'F';
}

export function calculateOverallGrade(factors: RiskFactors): GradeBreakdown {
  const weights = {
    permissions: 0.30,
    network: 0.25,
    contentScripts: 0.15,
    exfiltration: 0.20,
    manifest: 0.10,
  };

  const overall =
    factors.permissionScore * weights.permissions +
    factors.networkScore * weights.network +
    factors.contentScriptScore * weights.contentScripts +
    factors.exfiltrationScore * weights.exfiltration +
    factors.manifestScore * weights.manifest;

  return {
    overall: scoreToGrade(overall),
    permissions: scoreToGrade(factors.permissionScore),
    network: scoreToGrade(factors.networkScore),
    contentScripts: scoreToGrade(factors.contentScriptScore),
    exfiltration: scoreToGrade(factors.exfiltrationScore),
    manifest: scoreToGrade(factors.manifestScore),
  };
}

export function gradeColor(grade: Grade): string {
  const colors: Record<Grade, string> = {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    E: '#ef4444',
    F: '#dc2626',
  };
  return colors[grade];
}

export function gradeLabel(grade: Grade): string {
  const labels: Record<Grade, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Fair',
    D: 'Poor',
    E: 'Very Poor',
    F: 'Critical',
  };
  return labels[grade];
}

export function gradeDescription(grade: Grade): string {
  const descriptions: Record<Grade, string> = {
    A: 'No significant security concerns detected. This extension follows best practices.',
    B: 'Minor concerns detected. Generally safe but could benefit from improvements.',
    C: 'Moderate risk factors present. Review permissions and network activity carefully.',
    D: 'Significant security concerns. Consider whether this extension is necessary.',
    E: 'High risk. Multiple serious issues detected. Use with caution.',
    F: 'Critical risk. This extension exhibits dangerous behavior. Uninstall recommended.',
  };
  return descriptions[grade];
}
