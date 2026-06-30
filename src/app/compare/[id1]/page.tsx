'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ComparisonView } from '@/components/comparison-view';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmptyState } from '@/components/empty-state';
import { ArrowLeft, GitCompare } from 'lucide-react';

// This page handles /compare/[id1]/ without [id2]
export default function CompareLandingPage() {
  const params = useParams<{ id1: string }>();
  const [secondId, setSecondId] = useState('');
  const [recentScans, setRecentScans] = useState<Array<{ id: string; fileName: string; extensionName: string | null; overallGrade: string }>>([]);

  useEffect(() => {
    fetch('/api/analyses?limit=10')
      .then((res) => res.json())
      .then((d) => setRecentScans(d.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="container py-8">
      <Link href={`/analysis/${params.id1}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to analysis
      </Link>

      <div className="glass max-w-2xl rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <GitCompare className="h-6 w-6 text-brand-400" />
          <h1 className="text-xl font-bold">Compare Extensions</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Select or enter the ID of another scan to compare:
        </p>

        <input
          type="text"
          value={secondId}
          onChange={(e) => setSecondId(e.target.value)}
          placeholder="Scan result ID..."
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none"
        />

        {secondId && (
          <Link
            href={`/compare/${params.id1}/${secondId}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
          >
            <GitCompare className="h-4 w-4" />
            Compare Now
          </Link>
        )}

        {recentScans.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent scans</p>
            <div className="space-y-1">
              {recentScans.filter(s => s.id !== params.id1).map((scan) => (
                <Link
                  key={scan.id}
                  href={`/compare/${params.id1}/${scan.id}`}
                  className="flex items-center justify-between rounded-lg bg-card/50 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <span className="truncate">{scan.extensionName || scan.fileName}</span>
                  <span className="font-mono text-xs text-muted-foreground">{scan.overallGrade}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
