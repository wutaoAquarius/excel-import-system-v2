'use client';

import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';
import { parseExcelFile } from '@/lib/excel/parser';
import { autoMatchColumns } from '@/lib/excel/matcher';
import { generateFingerprint } from '@/lib/excel/fingerprint';
import { applyMapping } from '@/lib/excel/applyMapping';
import { REQUIRED_FIELDS } from '@/lib/constants';

const { Dragger } = Upload;

export default function FileUploader() {
  const {
    setPhase,
    setFileName,
    setTotalRows,
    setImportProgress,
    setHeaders,
    setRawRows,
    setData,
    setMappings,
    setAddressParts,
    setFingerprint,
    setUsedHistoryTemplate,
    reset,
    phase,
  } = useImportStore();

  const handleUpload = async (file: File) => {
    // 重新上传时，先重置上一次的全部状态
    if (phase !== 'upload') {
      reset();
    }

    // 检查文件格式
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isExcel) {
      message.error('不支持的文件格式，请上传 .xlsx 或 .xls 文件');
      return false;
    }

    // 空文件检查
    if (file.size === 0) {
      message.error('文件为空，请检查');
      return false;
    }

    setFileName(file.name);
    setImportProgress(0);

    try {
      // 真实解析 Excel 文件
      const result = await parseExcelFile(file, (percent) => {
        setImportProgress(percent);
      });

      setHeaders(result.headers);
      setRawRows(result.rows);
      setTotalRows(result.rows.length);
      setImportProgress(100);

      // 生成模板指纹
      const fp = generateFingerprint(result.headers);
      setFingerprint(fp);

      // 尝试从 API 查询历史模板映射
      let usedHistory = false;
      try {
        const res = await fetch(`/api/templates?fingerprint=${fp}`);
        if (res.ok) {
          const templateData = await res.json();
          if (templateData && templateData.mappingRules) {
            // 找到历史模板，应用历史映射
            const historyMappings = result.headers.map((h) => ({
              sourceColumn: h,
              targetField: (templateData.mappingRules as Record<string, string>)[h] || null,
              isAutoMatched: true,
              confidence: 1,
            }));
            setMappings(historyMappings);
            setUsedHistoryTemplate(true);
            usedHistory = true;

            // 应用映射生成数据
            const mappedData = applyMapping(result.rows, historyMappings, null);
            setData(mappedData);
          }
        }
      } catch {
        // API 不可用时（如未配置数据库），静默忽略
      }

      // 没有历史模板，使用自动匹配
      if (!usedHistory) {
        const { mappings: autoMappings, addressParts } = autoMatchColumns(result.headers);
        setMappings(autoMappings);
        setAddressParts(addressParts);

        // 应用映射生成数据
        const mappedData = applyMapping(result.rows, autoMappings, addressParts);
        setData(mappedData);
      }

      // 判断是否所有列都 100% 自动识别，且必填字段全部覆盖
      const currentMappings = useImportStore.getState().mappings;
      const allAutoMatched = currentMappings.every(
        (m) => m.targetField !== null && m.isAutoMatched && m.confidence >= 0.8
      );
      const mappedFields = currentMappings
        .filter((m) => m.targetField)
        .map((m) => m.targetField);
      const allRequiredMapped = REQUIRED_FIELDS.every((f) => mappedFields.includes(f));

      if (allAutoMatched && allRequiredMapped) {
        message.success(
          `文件解析完成，共 ${result.rows.length} 条数据，所有列已自动识别`
        );
        setPhase('preview');
      } else {
        message.success(`文件解析完成，共 ${result.rows.length} 条数据，请确认列映射`);
        setPhase('mapping');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '文件解析失败';
      message.error(errorMessage);
      setImportProgress(0);
    }

    return false; // 阻止默认上传
  };

  return (
    <Dragger
      accept=".xlsx,.xls"
      showUploadList={false}
      beforeUpload={handleUpload}
      disabled={phase === 'submitting'}
      style={{ padding: '20px 0' }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ color: '#1677ff', fontSize: 48 }} />
      </p>
      <p style={{ fontSize: 16, fontWeight: 500 }}>
        点击或拖拽 Excel 文件到此区域上传
      </p>
      <p style={{ color: '#999' }}>
        支持 .xlsx 和 .xls 格式，支持多种模板自动识别
      </p>
    </Dragger>
  );
}
