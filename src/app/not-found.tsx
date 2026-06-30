'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="mt-4 text-xl font-semibold">Page not found</p>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            Analyze Extension
          </Link>
        </div>
      </div>
    </div>
  );
}
