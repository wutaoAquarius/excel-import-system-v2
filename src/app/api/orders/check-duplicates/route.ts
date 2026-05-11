import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/orders/check-duplicates
 * 检查外部编码是否与历史数据重复
 * 请求体: { codes: ["CODE001", "CODE002", ...] }
 * 响应:   { duplicates: ["CODE001"] }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { codes } = body;

  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json({ duplicates: [] });
  }

  // 过滤空值
  const validCodes = codes.filter((c: string) => c && c.trim());
  if (validCodes.length === 0) {
    return NextResponse.json({ duplicates: [] });
  }

  try {
    const { default: prisma } = await import('@/lib/prisma');

    const existing = await prisma.order.findMany({
      where: {
        externalCode: { in: validCodes },
      },
      select: { externalCode: true },
    });

    const duplicates = existing
      .map((o) => o.externalCode)
      .filter((c): c is string => c !== null);

    return NextResponse.json({ duplicates });
  } catch {
    // 数据库不可用，返回空
    return NextResponse.json({ duplicates: [] });
  }
}
