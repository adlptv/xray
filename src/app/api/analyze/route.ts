import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeExtension } from '@/lib/analyzer';
import { analyzeUrlSchema } from '@/lib/validators';
import { MAX_FILE_SIZE } from '@/lib/constants';
import unzipper from 'unzipper';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  try {
    let fileBuffer: Buffer | null = null;
    let fileName = '';
    let fileSize = 0;
    let sourceUrl: string | undefined;

    if (contentType.includes('application/json')) {
      // URL-based analysis
      const body = await request.json();
      const parsed = analyzeUrlSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid URL', details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      sourceUrl = parsed.data.url;

      // Fetch extension from Chrome Web Store
      try {
        const crxUrl = sourceUrl.replace(
          /https?:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)\/detail\//,
          'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=120.0&acceptformat=crx2,crx3&x=id%3D'
        );
        // Extract extension ID from URL
        const match = sourceUrl.match(/([a-z]{32})/i);
        if (match) {
          const extId = match[1];
          const downloadUrl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=120.0&acceptformat=crx2,crx3&x=id%3D${extId}%26installsource%3Dondemand%26uc`;
          const res = await fetch(downloadUrl);
          if (!res.ok) throw new Error('Failed to download extension');
          const arrayBuffer = await res.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          fileName = `${extId}.crx`;
          fileSize = fileBuffer.length;
        } else {
          throw new Error('Could not extract extension ID from URL');
        }
      } catch (err) {
        return NextResponse.json(
          { error: 'Failed to fetch extension from Chrome Web Store', details: err instanceof Error ? err.message : 'Unknown error' },
          { status: 502 }
        );
      }
    } else {
      // File upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 413 });
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileName = file.name;
      fileSize = file.size;
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'Could not process file' }, { status: 400 });
    }

    // Unzip the extension
    let files: Array<{ path: string; content: string; size: number }> = [];
    let manifest: Record<string, unknown> = {};

    try {
      const directory = await unzipper.Open.buffer(fileBuffer);
      for (const file of directory.files) {
        if (file.type === 'Directory') continue;
        const content = (await file.buffer()).toString('utf-8');
        const path = file.path;
        const size = content.length;
        files.push({ path, content, size });

        if (path === 'manifest.json') {
          try {
            manifest = JSON.parse(content);
          } catch {
            return NextResponse.json({ error: 'Invalid manifest.json — could not parse' }, { status: 400 });
          }
        }
      }
    } catch {
      return NextResponse.json({ error: 'Could not unzip file. Ensure it is a valid .crx or .zip.' }, { status: 400 });
    }

    if (!manifest.manifest_version) {
      return NextResponse.json({ error: 'No valid manifest.json found in archive' }, { status: 400 });
    }

    // Run analysis
    const result = analyzeExtension(manifest, files, fileName, fileSize);

    // Persist to database
    const scanResult = await prisma.scanResult.create({
      data: {
        fileName: result.fileName,
        fileSize: result.fileSize,
        extensionId: result.extensionId || null,
        extensionName: result.extensionName || null,
        version: result.version || null,
        manifestVersion: result.manifestVersion || null,
        overallGrade: result.overallGrade,
        overview: JSON.stringify(result.overview),
        permissions: {
          create: result.permissions.map((p) => ({
            name: p.name,
            description: p.description,
            riskLevel: p.riskLevel,
            grade: p.grade,
            warnings: JSON.stringify(p.warnings),
          })),
        },
        networkCalls: {
          create: result.networkCalls.map((nc) => ({
            url: nc.url,
            method: nc.method,
            domain: nc.domain,
            risk: nc.risk,
            flags: JSON.stringify(nc.flags),
          })),
        },
        contentScripts: {
          create: result.contentScripts.map((cs) => ({
            matches: JSON.stringify(cs.matches),
            fileName: cs.fileName,
            riskFlags: JSON.stringify(cs.riskFlags),
          })),
        },
        files: {
          create: result.files.map((f) => ({
            path: f.path,
            fileType: f.fileType,
            size: f.size,
            suspicious: f.suspicious,
          })),
        },
        vulnerabilities: {
          create: result.vulnerabilities.map((v) => ({
            severity: v.severity,
            category: v.category,
            description: v.description,
            filePath: v.filePath || null,
            lineNumber: v.lineNumber || null,
            remediation: v.remediation,
            cweId: v.cweId || null,
          })),
        },
        scanMetadata: {
          create: {
            scanDuration: result.overview.scanDuration,
            totalFiles: result.overview.totalFiles,
            totalSize: result.overview.totalSize,
          },
        },
      },
    });

    return NextResponse.json({ id: scanResult.id, grade: result.overallGrade });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
