'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div className={cn('glass rounded-xl p-5', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <div className="text-brand-400">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
