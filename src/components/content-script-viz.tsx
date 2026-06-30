'use client';

import { motion } from 'framer-motion';
import { Code2, AlertTriangle, Globe } from 'lucide-react';

interface ContentScript {
  matches: string[];
  fileName: string;
  riskFlags: string[];
}

const riskFlagColors: Record<string, string> = {
  'all-urls': 'text-red-400 bg-red-500/10',
  'all-sites': 'text-red-400 bg-red-500/10',
  'wildcard-protocol': 'text-amber-400 bg-amber-500/10',
  'wildcard-pattern': 'text-amber-400 bg-amber-500/10',
  'financial-site': 'text-red-400 bg-red-500/10',
  'auth-page': 'text-orange-400 bg-orange-500/10',
};

export function ContentScriptViz({ scripts }: { scripts: ContentScript[] }) {
  if (scripts.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <Code2 className="h-8 w-8 text-green-400" />
        <p className="text-lg font-medium">No content scripts found</p>
        <p className="text-sm text-muted-foreground">This extension does not inject scripts into web pages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scripts.map((script, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-brand-400" />
              <h4 className="font-mono text-sm font-semibold">{script.fileName}</h4>
            </div>
            {script.riskFlags.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-400">{script.riskFlags.length} risk flag(s)</span>
              </div>
            )}
          </div>

          {/* Match patterns visualization */}
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Injected into these URL patterns
            </p>
            <div className="flex flex-wrap gap-2">
              {script.matches.map((match, j) => (
                <span
                  key={j}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 font-mono text-xs"
                >
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  {match}
                </span>
              ))}
            </div>
          </div>

          {/* Risk flags */}
          {script.riskFlags.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Risk flags</p>
              <div className="flex flex-wrap gap-2">
                {script.riskFlags.map((flag, j) => (
                  <span
                    key={j}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                      riskFlagColors[flag] || 'text-muted-foreground bg-secondary'
                    }`}
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
