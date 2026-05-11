import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders
 * 查询运单列表（支持分页、筛选）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const externalCode = searchParams.get('externalCode') || '';
  const receiverName = searchParams.get('receiverName') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const status = searchParams.get('status') || '';

  try {
    const { default: prisma } = await import('@/lib/prisma');

    // 构建查询条件
    const where: Record<string, unknown> = {};
    if (externalCode) {
      where.externalCode = { contains: externalCode };
    }
    if (receiverName) {
      where.receiverName = { contains: receiverName };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate + 'T23:59:59Z');
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      total,
      page,
      pageSize,
    });
  } catch {
    // 数据库不可用，返回空数据
    return NextResponse.json({
      data: [],
      total: 0,
      page,
      pageSize,
    });
  }
}

/**
 * POST /api/orders
 * 批量创建运单
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { orders, fileName } = body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return NextResponse.json({ error: '无有效数据' }, { status: 400 });
  }

  try {
    const { default: prisma } = await import('@/lib/prisma');

    // 创建导入批次
    const batch = await prisma.importBatch.create({
      data: {
        fileName: fileName || null,
        totalCount: orders.length,
        status: 'processing',
      },
    });

    let successCount = 0;
    let failedCount = 0;
    const failedRows: { row: number; reason: string }[] = [];

    // 逐条插入（处理外部编码唯一约束冲突）
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      try {
        await prisma.order.create({
          data: {
            externalCode: order.externalCode || null,
            senderName: order.senderName,
            senderPhone: order.senderPhone,
            senderAddress: order.senderAddress,
            receiverName: order.receiverName,
            receiverPhone: order.receiverPhone,
            receiverAddress: order.receiverAddress,
            weight: order.weight,
            quantity: order.quantity,
            temperature: order.temperature,
            remark: order.remark || null,
            batchId: batch.id,
          },
        });
        successCount++;
      } catch (err: unknown) {
        failedCount++;
        const reason =
          err instanceof Error && err.message.includes('Unique')
            ? '外部编码与历史数据重复'
            : '数据写入失败';
        failedRows.push({ row: i + 1, reason });
      }
    }

    // 更新批次状态
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        successCount,
        failedCount,
        status: failedCount === 0 ? 'completed' : 'partial',
      },
    });

    return NextResponse.json({
      batchId: batch.id,
      successCount,
      failedCount,
      failedRows: failedRows.length > 0 ? failedRows : undefined,
    });
  } catch {
    // 数据库不可用
    return NextResponse.json(
      { error: '数据库服务不可用，请检查配置' },
      { status: 503 }
    );
  }
}
