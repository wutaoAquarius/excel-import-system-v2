'use client';

import React from 'react';
import { Progress, Typography, Space } from 'antd';
import { useImportStore } from '@/store/importStore';

const { Text } = Typography;

export default function ImportProgress() {
  const { importProgress, totalRows } = useImportStore();
  const currentRows = Math.floor((importProgress / 100) * (totalRows || 20));

  return (
    <div style={{ marginTop: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>正在解析文件...</Text>
          <Text type="secondary">
            {currentRows}/{totalRows || '?'} 条
          </Text>
        </div>
        <Progress
          percent={Math.round(importProgress)}
          status={importProgress >= 100 ? 'success' : 'active'}
          strokeColor={{
            '0%': '#1677ff',
            '100%': '#52c41a',
          }}
        />
      </Space>
    </div>
  );
}
