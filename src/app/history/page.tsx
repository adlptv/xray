'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, Shield, Plus, Trash2, Calendar } from 'lucide-react';
import { GradeBadge } from '@/components/grade-badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmptyState } from '@/components/empty-state';
import { formatBytes } from '@/lib/utils';

interface ScanResult {
  id: string;
  fileName: string;
  extensionName: string | null;
  version: string | null;
  overallGrade: string;
  fileSize: number;
  createdAt: string;
  scanMetadata: { totalFiles: number } | null;
}

export default function HistoryPage() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/analyses?page=${page}&limit=20`)
      .then((res) => res.json())
      .then((d) => {
        setResults(d.data || []);
        setTotalPages(d.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
          <p className="mt-1 text-muted-foreground">View and manage past extension analyses.</p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          New Scan
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading history..." />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title="No scans yet"
          description="Upload your first browser extension to get started with security analysis."
          action={
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Upload Extension
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4">
            {results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/analysis/${result.id}`}>
                  <div className="glass glass-hover flex items-center gap-4 rounded-2xl p-5 transition-all hover:scale-[1.01]">
                    <GradeBadge grade={result.overallGrade} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {result.extensionName || result.fileName}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(result.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                        {result.version && <span>v{result.version}</span>}
                        <span>{formatBytes(result.fileSize)}</span>
                        {result.scanMetadata && <span>{result.scanMetadata.totalFiles} files</span>}
                      </div>
                    </div>
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-card/50 px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-card/50 px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
