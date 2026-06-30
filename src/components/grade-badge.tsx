import { cn } from '@/lib/utils';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const gradeLabels: Record<string, string> = {
  A: 'Excellent',
  B: 'Good',
  C: 'Fair',
  D: 'Poor',
  E: 'Very Poor',
  F: 'Critical',
};

export function GradeBadge({ grade, size = 'md', showLabel = false }: GradeBadgeProps) {
  const upperGrade = grade.toUpperCase();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-lg border',
          `bg-grade-${upperGrade.toLowerCase()}`,
          `grade-${upperGrade.toLowerCase()}`,
          sizeClasses[size]
        )}
      >
        {upperGrade}
      </span>
      {showLabel && (
        <span className="text-muted-foreground text-sm">
          {gradeLabels[upperGrade] || 'Unknown'}
        </span>
      )}
    </div>
  );
}
