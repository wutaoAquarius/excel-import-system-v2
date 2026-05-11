'use client';

import React from 'react';
import { Card, Space, Button, message } from 'antd';
import {
  TableOutlined,
  DownloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';
import DataTable from '@/components/table/DataTable';
import ErrorSummary from '@/components/table/ErrorSummary';
import { exportToExcel } from '@/lib/excel/exporter';

export default function PreviewSection() {
  const { phase, data, errors, fileName, setPhase, setSubmitProgress, setSubmitResult } =
    useImportStore();

  const isVisible =
    phase === 'preview' || phase === 'submitting' || phase === 'result';

  if (!isVisible) return null;

  // 导出 Excel
  const handleExport = async () => {
    try {
      const exportName = fileName
        ? fileName.replace(/\.(xlsx|xls)$/i, '_已编辑.xlsx')
        : '运单数据.xlsx';
      await exportToExcel(data, exportName);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  // 提交下单
  const handleSubmit = async () => {
    if (errors.length > 0) {
      message.error(`存在 ${errors.length} 个错误，请先修正后再提交`);
      return;
    }

    setPhase('submitting');
    setSubmitProgress(0);

    const total = data.length;
    const BATCH_SIZE = 100;
    let successCount = 0;
    let failedCount = 0;
    const failedRows: { row: number; reason: string }[] = [];

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orders: batch.map((row) => ({
              externalCode: row.externalCode || null,
              senderName: String(row.senderName),
              senderPhone: String(row.senderPhone),
              senderAddress: String(row.senderAddress),
              receiverName: String(row.receiverName),
              receiverPhone: String(row.receiverPhone),
              receiverAddress: String(row.receiverAddress),
              weight: Number(row.weight),
              quantity: Number(row.quantity),
              temperature: String(row.temperature),
              remark: row.remark ? String(row.remark) : null,
            })),
            fileName: fileName,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          successCount += result.successCount ?? batch.length;
          failedCount += result.failedCount ?? 0;
          if (result.failedRows) {
            failedRows.push(...result.failedRows);
          }
        } else {
          // 整批失败
          failedCount += batch.length;
          batch.forEach((row) => {
            failedRows.push({
              row: row.rowIndex,
              reason: '服务器错误',
            });
          });
        }
      } catch {
        failedCount += batch.length;
        batch.forEach((row) => {
          failedRows.push({
            row: row.rowIndex,
            reason: '网络错误',
          });
        });
      }

      const progress = Math.min(((i + batch.length) / total) * 100, 100);
      setSubmitProgress(progress);
    }

    setSubmitResult({
      total,
      success: successCount,
      failed: failedCount,
      failedRows: failedRows.length > 0 ? failedRows : undefined,
    });
    setPhase('result');
    message.success('提交完成');
  };

  return (
    <div className="section-card">
      <Card
        title={
          <Space>
            <TableOutlined style={{ color: '#1677ff' }} />
            <span>第三步：数据预览与编辑</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出 Excel
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              disabled={phase === 'submitting' || phase === 'result'}
              loading={phase === 'submitting'}
            >
              {phase === 'submitting' ? '提交中...' : '提交下单'}
            </Button>
          </Space>
        }
      >
        <ErrorSummary />
        <DataTable />
      </Card>
    </div>
  );
}
