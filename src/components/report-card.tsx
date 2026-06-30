'use client';

import { motion } from 'framer-motion';
import { GradeBadge } from './grade-badge';
import { gradeDescription } from '@/lib/grade';
import { Shield, Clock, FileCode, HardDrive } from 'lucide-react';
import { formatBytes, formatDuration } from '@/lib/utils';

interface ReportCardProps {
  grade: string;
  gradeBreakdown?: {
    permissions: string;
    network: string;
    contentScripts: string;
    exfiltration: string;
    manifest: string;
  };
  overview?: {
    totalFiles: number;
    totalSize: number;
    scanDuration: number;
    engine: string;
  };
  extensionName?: string | null;
  version?: string | null;
  fileName?: string;
  createdAt?: string;
}

const breakdownLabels: Array<{ key: string; label: string }> = [
  { key: 'permissions', label: 'Permissions' },
  { key: 'network', label: 'Network' },
  { key: 'contentScripts', label: 'Content Scripts' },
  { key: 'exfiltration', label: 'Exfiltration' },
  { key: 'manifest', label: 'Manifest' },
];

export function ReportCard({
  grade,
  gradeBreakdown,
  overview,
  extensionName,
  version,
  fileName,
  createdAt,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-brand-400" />
            <h2 className="text-2xl font-bold">
              {extensionName || fileName || 'Extension Analysis'}
            </h2>
          </div>
          {(version || createdAt) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {version && `v${version}`}
              {version && createdAt && ' • '}
              {createdAt && new Date(createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall Grade</p>
            <p className="text-sm text-muted-foreground">{gradeDescription(grade as 'A' | 'B' | 'C' | 'D' | 'E' | 'F')}</p>
          </div>
          <GradeBadge grade={grade} size="lg" />
        </div>
      </div>

      {/* Breakdown */}
      {gradeBreakdown && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {breakdownLabels.map(({ key, label }) => {
            const g = gradeBreakdown[key as keyof typeof gradeBreakdown];
            return (
              <div key={key} className="rounded-xl border border-border bg-card/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-2 flex justify-center">
                  <GradeBadge grade={g} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {overview && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <FileCode className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-muted-foreground">Files</p>
              <p className="font-semibold">{overview.totalFiles}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="font-semibold">{formatBytes(overview.totalSize)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-muted-foreground">Scan Time</p>
              <p className="font-semibold">{formatDuration(overview.scanDuration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-muted-foreground">Engine</p>
              <p className="font-semibold">{overview.engine}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
