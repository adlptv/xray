import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; id2: string } }
) {
  const { id, id2 } = params;

  if (id === id2) {
    return NextResponse.json({ error: 'Cannot compare an extension with itself' }, { status: 400 });
  }

  const [scanA, scanB] = await Promise.all([
    prisma.scanResult.findUnique({
      where: { id },
      include: { permissions: true, networkCalls: true, scanMetadata: true },
    }),
    prisma.scanResult.findUnique({
      where: { id2 },
      include: { permissions: true, networkCalls: true, scanMetadata: true },
    }),
  ]);

  if (!scanA || !scanB) {
    return NextResponse.json({ error: 'One or both scan results not found' }, { status: 404 });
  }

  const comparison = {
    scanA: {
      id: scanA.id,
      fileName: scanA.fileName,
      extensionName: scanA.extensionName,
      version: scanA.version,
      overallGrade: scanA.overallGrade,
      createdAt: scanA.createdAt,
    },
    scanB: {
      id: scanB.id,
      fileName: scanB.fileName,
      extensionName: scanB.extensionName,
      version: scanB.version,
      overallGrade: scanB.overallGrade,
      createdAt: scanB.createdAt,
    },
    gradeDifference: gradeRank(scanA.overallGrade) - gradeRank(scanB.overallGrade),
    permissionsComparison: {
      scanAPermissions: scanA.permissions.map((p) => p.name),
      scanBPermissions: scanB.permissions.map((p) => p.name),
      commonPermissions: scanA.permissions
        .filter((pa) => scanB.permissions.some((pb) => pb.name === pa.name))
        .map((p) => p.name),
      onlyInA: scanA.permissions
        .filter((pa) => !scanB.permissions.some((pb) => pb.name === pa.name))
        .map((p) => p.name),
      onlyInB: scanB.permissions
        .filter((pb) => !scanA.permissions.some((pa) => pa.name === pb.name))
        .map((p) => p.name),
    },
    networkComparison: {
      scanACount: scanA.networkCalls.length,
      scanBCount: scanB.networkCalls.length,
      scanADomains: [...new Set(scanA.networkCalls.map((nc) => nc.domain))],
      scanBDomains: [...new Set(scanB.networkCalls.map((nc) => nc.domain))],
    },
    sizeComparison: {
      scanASize: scanA.fileSize,
      scanBSize: scanB.fileSize,
      difference: scanB.fileSize - scanA.fileSize,
    },
  };

  // Store comparison
  await prisma.comparison.create({
    data: {
      scanIdA: id,
      scanIdB: id2,
      result: JSON.stringify(comparison),
    },
  });

  return NextResponse.json(comparison);
}

function gradeRank(grade: string): number {
  const ranks: Record<string, number> = { A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  return ranks[grade.toUpperCase()] || 0;
}
