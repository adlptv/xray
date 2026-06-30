'use client';

import { motion } from 'framer-motion';
import { Eye, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { RISK_COLORS, RISK_BG_COLORS } from '@/lib/constants';

interface ExfilFinding {
  type: string;
  severity: string;
  description: string;
  evidence: string;
  filePath?: string;
}

const findingTypeLabels: Record<string, string> = {
  'clipboard-access': 'Clipboard Access',
  'cookie-access': 'Cookie Access',
  'local-storage-read': 'Local Storage Read',
  'local-storage-write': 'Local Storage Write',
  'session-storage': 'Session Storage',
  'indexed-db': 'IndexedDB',
  'form-capture': 'Form Capture',
  'screenshot': 'Screenshot',
  'keylogging': 'Keylogging',
  'geolocation': 'Geolocation',
  'eval-execution': 'Dynamic Code Execution',
  'websocket-exfil': 'WebSocket',
  'beacon': 'Beacon API',
  'permission-query': 'Permission Query',
  'fingerprinting': 'Device Fingerprinting',
  'canvas-fingerprinting': 'Canvas Fingerprinting',
  'web-rtc-leak': 'WebRTC Leak',
  'external-fetch': 'External Fetch',
};

export function ExfilDetector({ findings }: { findings: ExfilFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <ShieldCheck className="h-8 w-8 text-green-400" />
        <p className="text-lg font-medium">No exfiltration risks detected</p>
        <p className="text-sm text-muted-foreground">
          No suspicious data access patterns found in the extension source code.
        </p>
      </div>
    );
  }

  const criticalFindings = findings.filter((f) => f.severity === 'critical');
  const highFindings = findings.filter((f) => f.severity === 'high');
  const mediumFindings = findings.filter((f) => f.severity === 'medium');
  const lowFindings = findings.filter((f) => f.severity === 'low');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <Eye className="h-6 w-6 text-brand-400" />
          <h3 className="text-lg font-semibold">Data Exfiltration Analysis</h3>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {criticalFindings.length > 0 && (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: RISK_BG_COLORS.critical }}>
              <div className="text-2xl font-bold" style={{ color: RISK_COLORS.critical }}>{criticalFindings.length}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          )}
          {highFindings.length > 0 && (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: RISK_BG_COLORS.high }}>
              <div className="text-2xl font-bold" style={{ color: RISK_COLORS.high }}>{highFindings.length}</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
          )}
          {mediumFindings.length > 0 && (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: RISK_BG_COLORS.medium }}>
              <div className="text-2xl font-bold" style={{ color: RISK_COLORS.medium }}>{mediumFindings.length}</div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </div>
          )}
          {lowFindings.length > 0 && (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: RISK_BG_COLORS.low }}>
              <div className="text-2xl font-bold" style={{ color: RISK_COLORS.low }}>{lowFindings.length}</div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
          )}
        </div>
      </div>

      {/* Findings list */}
      {findings.map((finding, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: RISK_BG_COLORS[finding.severity] }}
            >
              {finding.severity === 'critical' || finding.severity === 'high' ? (
                <AlertTriangle className="h-4 w-4" style={{ color: RISK_COLORS[finding.severity] }} />
              ) : (
                <ShieldAlert className="h-4 w-4" style={{ color: RISK_COLORS[finding.severity] }} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  {findingTypeLabels[finding.type] || finding.type}
                </h4>
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-medium uppercase"
                  style={{
                    backgroundColor: RISK_BG_COLORS[finding.severity],
                    color: RISK_COLORS[finding.severity],
                  }}
                >
                  {finding.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{finding.description}</p>
              {finding.filePath && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">📍 {finding.filePath}</p>
              )}
              <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary/50 p-2 font-mono text-xs text-muted-foreground">
                {finding.evidence}
              </pre>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
