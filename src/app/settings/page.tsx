'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Github, Trash2, Download } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function SettingsPage() {
  const [health, setHealth] = useState<{ status: string; database: string; version: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure XRay Security Analyzer.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* System Health */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-semibold">System Health</h2>
          </div>
          {loading ? (
            <LoadingSpinner label="Checking health..." className="py-4" />
          ) : health ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-card/50 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-medium ${health.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                  {health.status}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-card/50 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium">{health.database}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-card/50 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">{health.version}</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Could not reach health endpoint.</p>
          )}
        </section>

        {/* Analysis Defaults */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-semibold">Analysis Defaults</h2>
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Maximum file size (MB)</span>
              <input
                type="number"
                defaultValue={50}
                className="w-24 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Minimum grade for auto-approve</span>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span className="text-sm">Auto-flag critical permissions (management, debugger)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span className="text-sm">Detect data exfiltration patterns</span>
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span className="text-sm">Notify when scan completes</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-sm">Notify on critical grade (D or below)</span>
            </label>
          </div>
        </section>

        {/* Data Management */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-semibold">Data Management</h2>
          </div>
          <div className="mt-4 space-y-3">
            <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3 text-sm transition-colors hover:bg-accent">
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export all scan results (JSON)
              </span>
            </button>
            <button className="flex w-full items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/20">
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete all scan history
              </span>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-semibold">About</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            XRay Security Analyzer v1.0.0 — Open-source browser extension security analysis tool.
            Static analysis engine runs locally — no data leaves your machine.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-brand-400 hover:underline"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </section>
      </div>
    </div>
  );
}
