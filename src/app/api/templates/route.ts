import { NextRequest, NextResponse } from 'next/server';

// 内存缓存（无数据库时的降级方案）
const templateCache = new Map<string, { headerNames: string[]; mappingRules: Record<string, string>; lastUsedAt: string }>();

/**
 * GET /api/templates?fingerprint=xxx
 * 查询模板映射规则
 */
export async function GET(request: NextRequest) {
  const fingerprint = request.nextUrl.searchParams.get('fingerprint');
  if (!fingerprint) {
    return NextResponse.json({ error: '缺少 fingerprint 参数' }, { status: 400 });
  }

  try {
    // 尝试使用 Prisma（如果数据库已配置）
    const { default: prisma } = await import('@/lib/prisma');
    const template = await prisma.templateMapping.findUnique({
      where: { fingerprint },
    });

    if (template) {
      // 更新最后使用时间
      await prisma.templateMapping.update({
        where: { fingerprint },
        data: { lastUsedAt: new Date() },
      });
      return NextResponse.json({
        fingerprint: template.fingerprint,
        headerNames: template.headerNames,
        mappingRules: template.mappingRules,
        lastUsedAt: template.lastUsedAt,
      });
    }
    return NextResponse.json(null, { status: 404 });
  } catch {
    // 数据库不可用，使用内存缓存
    const cached = templateCache.get(fingerprint);
    if (cached) {
      return NextResponse.json(cached);
    }
    return NextResponse.json(null, { status: 404 });
  }
}

/**
 * POST /api/templates
 * 保存模板映射规则（模板记忆学习）
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fingerprint, headerNames, mappingRules } = body;

  if (!fingerprint || !mappingRules) {
    return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
  }

  try {
    const { default: prisma } = await import('@/lib/prisma');
    const result = await prisma.templateMapping.upsert({
      where: { fingerprint },
      update: {
        headerNames,
        mappingRules,
        lastUsedAt: new Date(),
      },
      create: {
        fingerprint,
        headerNames,
        mappingRules,
      },
    });
    return NextResponse.json({ id: result.id, fingerprint: result.fingerprint });
  } catch {
    // 数据库不可用，保存到内存
    templateCache.set(fingerprint, {
      headerNames,
      mappingRules,
      lastUsedAt: new Date().toISOString(),
    });
    return NextResponse.json({ fingerprint, source: 'memory' });
  }
}
