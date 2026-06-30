'use client';

import { Check, X, AlertTriangle, Info, FileWarning } from 'lucide-react';
import { GradeBadge } from './grade-badge';

interface ManifestIssue {
  severity: string;
  category: string;
  message: string;
  remediation: string;
}

interface ManifestCheckProps {
  version: number | string;
  isV3: boolean;
  issues: ManifestIssue[];
  migrationBlocked: boolean;
  score: number;
  grade: string;
}

const severityIcons: Record<string, typeof Check> = {
  error: X,
  warning: AlertTriangle,
  info: Info,
};

const severityColors: Record<string, string> = {
  error: 'text-red-400 bg-red-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  info: 'text-blue-400 bg-blue-500/10',
};

export function ManifestCheck({ version, isV3, issues, migrationBlocked, score, grade }: ManifestCheckProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileWarning className="h-5 w-5 text-brand-400" />
              Manifest V2/V3 Compatibility
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manifest Version: <span className="font-mono font-bold">v{version}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isV3 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-400">
                <Check className="h-4 w-4" />
                V3 Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400">
                <X className="h-4 w-4" />
                Needs Migration
              </span>
            )}
            <GradeBadge grade={grade} size="md" />
          </div>
        </div>

        {migrationBlocked && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Manifest V3 migration is blocked by critical issues below.
          </div>
        )}
      </div>

      {/* Issues list */}
      {issues.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
          <Check className="h-8 w-8 text-green-400" />
          <p className="text-lg font-medium">No manifest issues found</p>
        </div>
      ) : (
        issues.map((issue, i) => {
          const Icon = severityIcons[issue.severity] || Info;
          return (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${severityColors[issue.severity] || ''}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {issue.category}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium uppercase ${severityColors[issue.severity] || ''}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{issue.message}</p>
                  <div className="mt-2 rounded-lg bg-secondary/30 p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Remediation:</span> {issue.remediation}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
