'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ComparisonView } from '@/components/comparison-view';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmptyState } from '@/components/empty-state';
import { ArrowLeft, GitCompare, Search } from 'lucide-react';

interface ComparisonData {
  scanA: { id: string; fileName: string; extensionName: string | null; version: string | null; overallGrade: string; createdAt: string };
  scanB: { id: string; fileName: string; extensionName: string | null; version: string | null; overallGrade: string; createdAt: string };
  gradeDifference: number;
  permissionsComparison: { scanAPermissions: string[]; scanBPermissions: string[]; commonPermissions: string[]; onlyInA: string[]; onlyInB: string[] };
  networkComparison: { scanACount: number; scanBCount: number; scanADomains: string[]; scanBDomains: string[] };
  sizeComparison: { scanASize: number; scanBSize: number; difference: number };
}

export default function ComparePage() {
  const params = useParams<{ id1: string; id2?: string }>();
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secondId, setSecondId] = useState('');
  const [needsSecond, setNeedsSecond] = useState(!params.id2);

  useEffect(() => {
    if (params.id2) {
      fetch(`/api/analyses/${params.id1}/compare/${params.id2}`)
        .then((res) => {
          if (!res.ok) throw new Error('Comparison failed');
          return res.json();
        })
        .then(setComparison)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params.id1, params.id2]);

  if (loading) return <LoadingSpinner label="Comparing extensions..." className="py-24" />;

  if (needsSecond || !params.id2) {
    return (
      <div className="container py-8">
        <Link href={`/analysis/${params.id1}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to analysis
        </Link>
        <div className="glass max-w-lg rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <GitCompare className="h-6 w-6 text-brand-400" />
            <h1 className="text-xl font-bold">Compare Extensions</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the ID of the extension you want to compare against:
          </p>
          <input
            type="text"
            value={secondId}
            onChange={(e) => setSecondId(e.target.value)}
            placeholder="Scan result ID..."
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none"
          />
          <Link
            href={`/compare/${params.id1}/${secondId}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Compare
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: Go to History, analyze another extension, then copy its ID.
          </p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="container py-12">
        <EmptyState
          icon={<GitCompare className="h-12 w-12" />}
          title="Comparison failed"
          description={error || 'Could not load comparison data.'}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ComparisonView data={comparison} />
    </div>
  );
}
