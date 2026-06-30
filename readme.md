# XRay — Browser Extension Security Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

Upload a browser extension (CRX or ZIP) and get a security report. Analyzes permissions, network calls, content script injection, and data exfiltration patterns. Uses an A-F grading scale across five dimensions.

## Screenshots

| Security Report Card — Grade D | Permission Risk and Exfiltration Detail |
|:---:|:---:|
| ![Security Report Card — Grade D](screenshots/hero.png) | ![Permission Risk and Exfiltration Detail](screenshots/dashboard.png) |

## Features

- Upload CRX, ZIP, or paste a Chrome Web Store URL
- Sandboxed analysis: unpacks and inspects extension code without executing it
- Permission audit: 40+ permissions with individual risk scores and chain-of-abuse detection
- Network call audit: traces all fetch and XHR destinations, flags data sent to unknown domains
- 18 exfiltration detection patterns: clipboard access, keylogging, fingerprinting, localStorage-to-fetch chains
- Content script injection mapping: which scripts run on which pages
- Manifest v2 to v3 compatibility check with migration suggestions
- Side-by-side comparison of two extensions

## Quick Start

```bash
git clone https://github.com/adlptv/xray.git
cd xray
pnpm install
pnpm dev
```

Or:
```bash
docker-compose up
```

## Architecture

```
apps/xray/
├── src/app/          # Pages: landing, upload, analysis/[id], history, compare, settings
│   └── api/          # analyze, analyses, permissions, health
├── src/components/   # ReportCard, PermissionList, NetworkTable, ExfilDetector, ComparisonView, UI primitives
├── src/lib/          # analyzer, grade, permissions, network-analyzer, exfil-detector, manifest-checker, validators (Zod)
├── prisma/           # SQLite: Analysis, OrganizationPolicy
└── tests/            # Vitest + Playwright
```

## Grading Dimensions

| Dimension | Weight | What It Checks |
|-----------|--------|----------------|
| Permissions | 40% | Requested permissions, risk levels, abuse chains |
| Network Safety | 20% | All network call destinations, tracking detection |
| Content Scripts | 15% | Injection scope, page access patterns |
| Data Exfiltration | 15% | Pattern matches across 18 heuristics |
| Manifest Health | 10% | v2 deprecation status, CSP, update URL |

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/analyze | Upload extension, run analysis, return report |
| GET | /api/analyses | List past analyses |
| GET/DELETE | /api/analyses/[id] | Get or delete an analysis |
| GET | /api/analyses/[id]/compare/[id2] | Compare two analyses |
| GET | /api/permissions | Permission risk database |
| GET | /api/health | Health check |

## Security

- Zod validation on all routes
- Sandboxed code analysis: extension JavaScript is never executed
- Rate limiting
- Helmet.js headers

## License

MIT