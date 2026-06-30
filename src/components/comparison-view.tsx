'use client';

import { motion } from 'framer-motion';
import { GitCompare, ArrowRight, Check, X, Minus } from 'lucide-react';
import { GradeBadge } from './grade-badge';

interface ComparisonData {
  scanA: {
    id: string;
    fileName: string;
    extensionName: string | null;
    version: string | null;
    overallGrade: string;
    createdAt: string;
  };
  scanB: {
    id: string;
    fileName: string;
    extensionName: string | null;
    version: string | null;
    overallGrade: string;
    createdAt: string;
  };
  gradeDifference: number;
  permissionsComparison: {
    scanAPermissions: string[];
    scanBPermissions: string[];
    commonPermissions: string[];
    onlyInA: string[];
    onlyInB: string[];
  };
  networkComparison: {
    scanACount: number;
    scanBCount: number;
    scanADomains: string[];
    scanBDomains: string[];
  };
  sizeComparison: {
    scanASize: number;
    scanBSize: number;
    difference: number;
  };
}

export function ComparisonView({ data }: { data: ComparisonData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <GitCompare className="h-6 w-6 text-brand-400" />
          <h2 className="text-xl font-bold">Extension Comparison</h2>
        </div>
      </div>

      {/* Side-by-side grades */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { scan: data.scanA, label: 'Extension A' },
          { scan: data.scanB, label: 'Extension B' },
        ].map(({ scan, label }) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <h3 className="mt-1 text-lg font-semibold">
              {scan.extensionName || scan.fileName}
            </h3>
            {scan.version && <p className="text-sm text-muted-foreground">v{scan.version}</p>}
            <div className="mt-4 flex items-center gap-3">
              <GradeBadge grade={scan.overallGrade} size="lg" />
              <span className="text-sm text-muted-foreground">
                {new Date(scan.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grade difference */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Grade Difference</h3>
        <div className="mt-2 flex items-center gap-3">
          {data.gradeDifference > 0 ? (
            <span className="text-green-400">Extension A is safer by {data.gradeDifference} grade(s)</span>
          ) : data.gradeDifference < 0 ? (
            <span className="text-green-400">Extension B is safer by {Math.abs(data.gradeDifference)} grade(s)</span>
          ) : (
            <span className="text-muted-foreground">Both extensions have the same grade</span>
          )}
        </div>
      </div>

      {/* Permissions comparison */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold">Permissions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Common */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-green-400">
              <Check className="h-4 w-4" />
              Common ({data.permissionsComparison.commonPermissions.length})
            </p>
            <div className="space-y-1">
              {data.permissionsComparison.commonPermissions.map((p) => (
                <span key={p} className="block rounded bg-secondary/50 px-2 py-1 font-mono text-xs">
                  {p}
                </span>
              ))}
              {data.permissionsComparison.commonPermissions.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>

          {/* Only in A */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-400">
              <ArrowRight className="h-4 w-4" />
              Only in A ({data.permissionsComparison.onlyInA.length})
            </p>
            <div className="space-y-1">
              {data.permissionsComparison.onlyInA.map((p) => (
                <span key={p} className="block rounded bg-secondary/50 px-2 py-1 font-mono text-xs">
                  {p}
                </span>
              ))}
              {data.permissionsComparison.onlyInA.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>

          {/* Only in B */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-400">
              <ArrowRight className="h-4 w-4" />
              Only in B ({data.permissionsComparison.onlyInB.length})
            </p>
            <div className="space-y-1">
              {data.permissionsComparison.onlyInB.map((p) => (
                <span key={p} className="block rounded bg-secondary/50 px-2 py-1 font-mono text-xs">
                  {p}
                </span>
              ))}
              {data.permissionsComparison.onlyInB.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network & Size */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">Network Calls</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Extension A</p>
              <p className="text-2xl font-bold">{data.networkComparison.scanACount}</p>
              <p className="text-xs text-muted-foreground">
                {data.networkComparison.scanADomains.length} unique domains
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Extension B</p>
              <p className="text-2xl font-bold">{data.networkComparison.scanBCount}</p>
              <p className="text-xs text-muted-foreground">
                {data.networkComparison.scanBDomains.length} unique domains
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">File Size</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Extension A</p>
              <p className="text-2xl font-bold">{(data.sizeComparison.scanASize / 1024).toFixed(1)} KB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Extension B</p>
              <p className="text-2xl font-bold">{(data.sizeComparison.scanBSize / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            {data.sizeComparison.difference > 0 ? (
              <span className="text-amber-400">
                Extension B is {(data.sizeComparison.difference / 1024).toFixed(1)} KB larger
              </span>
            ) : data.sizeComparison.difference < 0 ? (
              <span className="text-amber-400">
                Extension A is {(Math.abs(data.sizeComparison.difference) / 1024).toFixed(1)} KB larger
              </span>
            ) : (
              <span className="text-muted-foreground">Same size</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
