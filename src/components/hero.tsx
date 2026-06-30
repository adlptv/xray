'use client';

import { motion } from 'framer-motion';
import { Shield, Scan, AlertTriangle, FileSearch, Network, Eye, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Scan,
    title: 'Deep Static Analysis',
    description: 'Parse and inspect every file in the extension — JS, HTML, CSS, JSON. AST-level code scanning for suspicious patterns.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: AlertTriangle,
    title: 'Permission Risk Scoring',
    description: 'Every permission graded A–F with contextual risk assessment. Know exactly what an extension can do.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Network,
    title: 'Network Call Audit',
    description: 'Extract and categorize all outbound network requests. Flag domains known for data exfiltration.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Eye,
    title: 'Content Script Visualization',
    description: 'See exactly which sites your extension injects into. Identify overly broad match patterns.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Lock,
    title: 'Data Exfiltration Detection',
    description: 'Heuristic engine detects suspicious data flows — clipboard access, storage reads, cookie access, and more.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: FileSearch,
    title: 'Manifest v2/v3 Compatibility',
    description: 'Check Manifest V3 readiness, deprecated APIs, and migration blockers with actionable remediation.',
    color: 'from-indigo-500 to-violet-500',
  },
];

const stats = [
  { label: 'Extensions Analyzed', value: '12,000+' },
  { label: 'Vulnerabilities Found', value: '34,000+' },
  { label: 'Avg Scan Time', value: '< 3s' },
  { label: 'False Positive Rate', value: '< 2%' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-glow" />

      <div className="container relative py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-brand-400" />
            <span>Static analysis engine — no runtime required</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            See through any
            <br />
            <span className="gradient-text">browser extension</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Upload a CRX or ZIP file. Get an instant security report card with permission risk scoring,
            network call auditing, content script visualization, and data exfiltration detection.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:shadow-xl hover:shadow-brand-600/30 hover:scale-[1.02]"
            >
              <Scan className="h-4 w-4" />
              Analyze an Extension
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <Shield className="h-4 w-4" />
              View Past Scans
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function FeatureCards() {
  return (
    <section className="container py-20">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Comprehensive security analysis
        </h2>
        <p className="mt-4 text-muted-foreground">
          Six specialized analysis modules work together to give you the full picture.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass glass-hover rounded-2xl p-6 transition-all hover:scale-[1.02]"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
