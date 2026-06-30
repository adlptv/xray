'use client';

import { Globe, AlertTriangle, Lock, Activity } from 'lucide-react';
import { RISK_COLORS, RISK_BG_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface NetworkCall {
  url: string;
  method: string;
  domain: string;
  risk: string;
  flags: string[];
}

const methodColors: Record<string, string> = {
  GET: 'text-blue-400',
  POST: 'text-green-400',
  PUT: 'text-amber-400',
  DELETE: 'text-red-400',
  WS: 'text-purple-400',
};

export function NetworkTable({ calls }: { calls: NetworkCall[] }) {
  if (calls.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <Globe className="h-8 w-8 text-green-400" />
        <p className="text-lg font-medium">No network calls detected</p>
        <p className="text-sm text-muted-foreground">No outbound network requests found in the extension source code.</p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Domain</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">URL</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Risk</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Flags</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call, i) => (
              <tr
                key={i}
                className="border-b border-border/50 transition-colors hover:bg-accent/30"
              >
                <td className="px-4 py-3">
                  <span className={cn('font-mono text-xs font-bold', methodColors[call.method] || 'text-gray-400')}>
                    {call.method}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs">{call.domain}</span>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <span className="block truncate font-mono text-xs text-muted-foreground" title={call.url}>
                    {call.url}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium uppercase"
                    style={{
                      backgroundColor: RISK_BG_COLORS[call.risk],
                      color: RISK_COLORS[call.risk],
                    }}
                  >
                    {call.risk === 'critical' && <AlertTriangle className="h-3 w-3" />}
                    {call.risk === 'low' && <Lock className="h-3 w-3" />}
                    {call.risk === 'medium' && <Activity className="h-3 w-3" />}
                    {call.risk}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {call.flags.map((flag, j) => (
                      <span
                        key={j}
                        className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
