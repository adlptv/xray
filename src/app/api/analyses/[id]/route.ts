import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const result = await prisma.scanResult.findUnique({
    where: { id },
    include: {
      permissions: true,
      networkCalls: true,
      contentScripts: true,
      files: true,
      vulnerabilities: true,
      scanMetadata: true,
    },
  });

  if (!result) {
    return NextResponse.json({ error: 'Scan result not found' }, { status: 404 });
  }

  // Parse JSON strings back to objects
  const formatted = {
    ...result,
    overview: result.overview ? JSON.parse(result.overview) : null,
    permissions: result.permissions.map((p) => ({
      ...p,
      warnings: p.warnings ? JSON.parse(p.warnings) : [],
    })),
    networkCalls: result.networkCalls.map((nc) => ({
      ...nc,
      flags: nc.flags ? JSON.parse(nc.flags) : [],
    })),
    contentScripts: result.contentScripts.map((cs) => ({
      ...cs,
      matches: cs.matches ? JSON.parse(cs.matches) : [],
      riskFlags: cs.riskFlags ? JSON.parse(cs.riskFlags) : [],
    })),
  };

  return NextResponse.json(formatted);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const result = await prisma.scanResult.findUnique({ where: { id } });
  if (!result) {
    return NextResponse.json({ error: 'Scan result not found' }, { status: 404 });
  }

  await prisma.scanResult.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
