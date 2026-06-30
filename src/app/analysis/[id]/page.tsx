'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReportCard } from '@/components/report-card';
import { PermissionList } from '@/components/permission-list';
import { NetworkTable } from '@/components/network-table';
import { ContentScriptViz } from '@/components/content-script-viz';
import { ExfilDetector } from '@/components/exfil-detector';
import { ManifestCheck } from '@/components/manifest-check';
import { VulnerabilityList } from '@/components/vulnerability-list';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmptyState } from '@/components/empty-state';
import { StatCard } from '@/components/stat-card';
import {
  Shield, KeyRound, Globe, Code2, Eye, FileWarning, Bug,
  ArrowLeft, GitCompare, Trash2,
} from 'lucide-react';

interface AnalysisData {
  id: string;
  fileName: string;
  fileSize: number;
  extensionName: string | null;
  version: string | null;
  manifestVersion: number | null;
  overallGrade: string;
  overview: { totalFiles: number; totalSize: number; scanDuration: number; engine: string } | null;
  createdAt: string;
  permissions: Array<{ name: string; description: string; riskLevel: string; grade: string; warnings: string[] }>;
  networkCalls: Array<{ url: string; method: string; domain: string; risk: string; flags: string[] }>;
  contentScripts: Array<{ matches: string[]; fileName: string; riskFlags: string[] }>;
  vulnerabilities: Array<{ severity: string; category: string; description: string; filePath: string | null; lineNumber: number | null; remediation: string; cweId: string | null }>;
  scanMetadata: { scanDuration: number; totalFiles: number; totalSize: number; engine: string } | null;
}

const gradeBreakdownFromData = (data: AnalysisData) => {
  // Derive sub-grades from permissions, network, etc.
  const permGrades = data.permissions.map((p) => p.grade);
  const networkRisks = data.networkCalls.map((nc) => nc.risk);

  const worstPerm = permGrades.length ? permGrades.sort()[permGrades.length - 1] : 'A';
  const hasHighRiskNetwork = networkRisks.some((r) => r === 'critical' || r === 'high');
  const hasMedRiskNetwork = networkRisks.some((r) => r === 'medium');

  return {
    permissions: worstPerm,
    network: hasHighRiskNetwork ? 'D' : hasMedRiskNetwork ? 'C' : 'A',
    contentScripts: data.contentScripts.length > 0 ? 'B' : 'A',
    exfiltration: data.vulnerabilities.some((v) => v.severity === 'high') ? 'D' : 'A',
    manifest: data.manifestVersion === 3 ? 'A' : 'D',
  };
};

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch(`/api/analyses/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingSpinner label="Loading analysis..." className="py-24" />;
  if (error || !data) {
    return (
      <div className="container py-12">
        <EmptyState
          icon={<Shield className="h-12 w-12" />}
          title="Analysis not found"
          description={error || 'The requested scan result could not be found.'}
          action={
            <Link href="/history" className="text-brand-400 hover:underline">
              View all scans →
            </Link>
          }
        />
      </div>
    );
  }

  const overview = data.overview || (data.scanMetadata ? {
    totalFiles: data.scanMetadata.totalFiles,
    totalSize: data.scanMetadata.totalSize,
    scanDuration: data.scanMetadata.scanDuration,
    engine: data.scanMetadata.engine,
  } : null);

  const breakdown = gradeBreakdownFromData(data);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'permissions', label: `Permissions (${data.permissions.length})`, icon: KeyRound },
    { id: 'network', label: `Network (${data.networkCalls.length})`, icon: Globe },
    { id: 'content-scripts', label: `Content Scripts (${data.contentScripts.length})`, icon: Code2 },
    { id: 'exfiltration', label: 'Exfiltration', icon: Eye },
    { id: 'manifest', label: 'Manifest', icon: FileWarning },
    { id: 'vulnerabilities', label: `Vulnerabilities (${data.vulnerabilities.length})`, icon: Bug },
  ];

  return (
    <div className="container py-8">
      {/* Back + actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/compare/${data.id}/`}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <GitCompare className="h-4 w-4" />
            Compare
          </Link>
          <button
            onClick={async () => {
              if (confirm('Delete this scan result?')) {
                await fetch(`/api/analyses/${data.id}`, { method: 'DELETE' });
                window.location.href = '/history';
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Report card */}
      <ReportCard
        grade={data.overallGrade}
        gradeBreakdown={breakdown}
        overview={overview || undefined}
        extensionName={data.extensionName}
        version={data.version}
        fileName={data.fileName}
        createdAt={data.createdAt}
      />

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Permissions" value={data.permissions.length} icon={<KeyRound className="h-4 w-4" />} />
        <StatCard label="Network Calls" value={data.networkCalls.length} icon={<Globe className="h-4 w-4" />} />
        <StatCard label="Content Scripts" value={data.contentScripts.length} icon={<Code2 className="h-4 w-4" />} />
        <StatCard label="Vulnerabilities" value={data.vulnerabilities.length} icon={<Bug className="h-4 w-4" />} />
      </div>

      {/* Tabs */}
      <div className="mt-8 overflow-x-auto">
        <div className="flex gap-1 rounded-xl border border-border bg-card/50 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <PermissionList permissions={data.permissions.slice(0, 3)} />
            <NetworkTable calls={data.networkCalls.slice(0, 5)} />
            {data.vulnerabilities.length > 0 && (
              <VulnerabilityList vulnerabilities={data.vulnerabilities.slice(0, 3)} />
            )}
          </div>
        )}
        {activeTab === 'permissions' && <PermissionList permissions={data.permissions} />}
        {activeTab === 'network' && <NetworkTable calls={data.networkCalls} />}
        {activeTab === 'content-scripts' && <ContentScriptViz scripts={data.contentScripts} />}
        {activeTab === 'exfiltration' && <ExfilDetector findings={[]} />}
        {activeTab === 'manifest' && (
          <ManifestCheck
            version={data.manifestVersion || 'unknown'}
            isV3={data.manifestVersion === 3}
            issues={[]}
            migrationBlocked={data.manifestVersion !== 3}
            score={data.manifestVersion === 3 ? 0 : 30}
            grade={data.manifestVersion === 3 ? 'A' : 'D'}
          />
        )}
        {activeTab === 'vulnerabilities' && <VulnerabilityList vulnerabilities={data.vulnerabilities} />}
      </motion.div>
    </div>
  );
}
