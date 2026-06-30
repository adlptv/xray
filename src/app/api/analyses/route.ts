import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paginationSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const parsed = paginationSchema.safeParse(queryParams);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, sort } = parsed.data;
  const skip = (page - 1) * limit;

  const orderBy = sort === 'newest'
    ? { createdAt: 'desc' as const }
    : sort === 'oldest'
    ? { createdAt: 'asc' as const }
    : sort === 'grade'
    ? { overallGrade: 'asc' as const }
    : { createdAt: 'desc' as const };

  const [results, total] = await Promise.all([
    prisma.scanResult.findMany({
      orderBy,
      skip,
      take: limit,
      include: {
        scanMetadata: true,
      },
    }),
    prisma.scanResult.count(),
  ]);

  return NextResponse.json({
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
