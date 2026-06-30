'use client';

import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { GradeBadge } from './grade-badge';
import { cn } from '@/lib/utils';
import { RISK_COLORS } from '@/lib/constants';

interface Permission {
  name: string;
  description: string;
  riskLevel: string;
  grade: string;
  warnings: string[];
}

const riskIcons: Record<string, typeof Shield> = {
  low: ShieldCheck,
  medium: Shield,
  high: ShieldAlert,
  critical: AlertTriangle,
};

export function PermissionList({ permissions }: { permissions: Permission[] }) {
  if (permissions.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <ShieldCheck className="h-8 w-8 text-green-400" />
        <p className="text-lg font-medium">No permissions requested</p>
        <p className="text-sm text-muted-foreground">This extension doesn't request any special permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {permissions.map((perm) => {
        const Icon = riskIcons[perm.riskLevel] || Shield;
        return (
          <div
            key={perm.name}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${RISK_COLORS[perm.riskLevel]}20` }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: RISK_COLORS[perm.riskLevel] }}
                  />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-semibold">{perm.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{perm.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium uppercase',
                    `bg-grade-${perm.grade.toLowerCase()}`
                  )}
                  style={{ color: RISK_COLORS[perm.riskLevel] }}
                >
                  {perm.riskLevel}
                </span>
                <GradeBadge grade={perm.grade} size="sm" />
              </div>
            </div>

            {perm.warnings.length > 0 && (
              <div className="mt-3 space-y-1 pl-11">
                {perm.warnings.map((warning, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-400">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
