import { NextResponse } from 'next/server';
import { PERMISSION_DATABASE } from '@/lib/permissions';

export async function GET() {
  const permissions = Object.values(PERMISSION_DATABASE).map((p) => ({
    name: p.name,
    description: p.description,
    riskLevel: p.riskLevel,
    baseScore: p.baseScore,
    warnings: p.warnings,
  }));

  return NextResponse.json({
    total: permissions.length,
    permissions: permissions.sort((a, b) => b.baseScore - a.baseScore),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { permissionNames } = body as { permissionNames: string[] };

  if (!Array.isArray(permissionNames)) {
    return NextResponse.json({ error: 'permissionNames must be an array' }, { status: 400 });
  }

  const results = permissionNames.map((name) => {
    const info = PERMISSION_DATABASE[name];
    if (info) {
      return {
        name: info.name,
        description: info.description,
        riskLevel: info.riskLevel,
        baseScore: info.baseScore,
        warnings: info.warnings,
      };
    }
    return {
      name,
      description: 'Unknown permission',
      riskLevel: 'medium',
      baseScore: 25,
      warnings: ['Unknown permission — risk level uncertain'],
    };
  });

  return NextResponse.json({ permissions: results });
}
