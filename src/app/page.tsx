import { Hero, FeatureCards } from '@/components/hero';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock, GitBranch } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureCards />

      {/* How it works */}
      <section className="container py-20">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-muted-foreground">Three steps from upload to insight.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Upload Extension',
              description: 'Drag & drop a .crx or .zip file, or paste a Chrome Web Store URL. Files are processed locally — nothing leaves your machine.',
              icon: ArrowRight,
            },
            {
              step: '02',
              title: 'Static Analysis',
              description: 'XRay unpacks, parses, and analyzes every file. AST-based scanning, permission evaluation, and network call extraction run in parallel.',
              icon: ShieldCheck,
            },
            {
              step: '03',
              title: 'Security Report Card',
              description: 'Get an A–F grade with detailed breakdowns. Permission risks, network calls, content script injection, exfiltration detection — all in one dashboard.',
              icon: Lock,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative glass rounded-2xl p-8">
                <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-bold">
                  {item.step}
                </div>
                <Icon className="mt-4 h-8 w-8 text-brand-400" />
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="glass relative overflow-hidden rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-glow" />
          <div className="relative">
            <GitBranch className="mx-auto h-10 w-10 text-brand-400" />
            <h2 className="mt-4 text-3xl font-bold">Ready to scan?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Upload your first extension and get a security report card in seconds.
            </p>
            <Link
              href="/upload"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
            >
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
