'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UploadCloud, Link2, Loader2, AlertCircle, FileArchive } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function FileUpload() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState<string>('');
  const [url, setUrl] = useState('');
  const [urlMode, setUrlMode] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setDraggedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-chrome-extension': ['.crx'],
      'application/octet-stream': ['.crx', '.zip'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!draggedFile) return;
    setUploadState('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', draggedFile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setUploadState('success');
      router.push(`/analysis/${data.id}`);
    } catch (err) {
      setUploadState('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setUploadState('uploading');
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setUploadState('success');
      router.push(`/analysis/${data.id}`);
    } catch (err) {
      setUploadState('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Toggle */}
      <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-card/50 p-1">
        <button
          onClick={() => setUrlMode(false)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            !urlMode ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <UploadCloud className="h-4 w-4" />
          File Upload
        </button>
        <button
          onClick={() => setUrlMode(true)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            urlMode ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Link2 className="h-4 w-4" />
          Web Store URL
        </button>
      </div>

      {uploadState === 'uploading' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass flex flex-col items-center justify-center gap-4 rounded-2xl p-16"
        >
          <Loader2 className="h-10 w-10 animate-spin text-brand-400" />
          <p className="text-lg font-medium">Analyzing extension...</p>
          <p className="text-sm text-muted-foreground">Running static analysis engine</p>
        </motion.div>
      ) : urlMode ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Chrome Web Store Extension URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://chromewebstore.google.com/detail/..."
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!url.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              <Link2 className="h-4 w-4" />
              Analyze
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Paste the full URL from the Chrome Web Store. XRay will fetch and analyze the extension.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <div
            {...getRootProps()}
            className={cn(
              'flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors',
              isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-border hover:border-brand-500/50'
            )}
          >
            <input {...getInputProps()} />
            {draggedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileArchive className="h-10 w-10 text-brand-400" />
                <p className="font-medium">{draggedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatBytes(draggedFile.size)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <UploadCloud className={cn('h-10 w-10 transition-colors', isDragActive ? 'text-brand-400' : 'text-muted-foreground')} />
                <p className="font-medium">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground">Supports .crx and .zip — max 50MB</p>
              </div>
            )}
          </div>

          {draggedFile && (
            <button
              onClick={handleUpload}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
            >
              <UploadCloud className="h-4 w-4" />
              Start Analysis
            </button>
          )}

          {uploadState === 'error' && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
