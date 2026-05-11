'use client';

import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import {
  CheckCircleOutlined,
  FileExcelOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';
import FileUploader from '@/components/upload/FileUploader';
import ImportProgress from '@/components/upload/ImportProgress';

const { Text } = Typography;

export default function UploadSection() {
  const { phase, fileName, totalRows, importProgress } = useImportStore();
  const [collapsed, setCollapsed] = React.useState(false);

  // 当进入后续阶段时自动收缩
  const isCompleted = phase !== 'upload';

  React.useEffect(() => {
    if (isCompleted) setCollapsed(true);
  }, [isCompleted]);

  // 收缩状态：显示摘要
  if (collapsed && isCompleted) {
    return (
      <div className="section-card">
        <div
          className="section-summary"
          onClick={() => setCollapsed(false)}
        >
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <FileExcelOutlined style={{ color: '#52c41a' }} />
            <Text strong>文件上传完成</Text>
            <Tag color="blue">{fileName}</Tag>
            <Tag color="green">{totalRows} 条数据</Tag>
          </Space>
          <DownOutlined style={{ color: '#999' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <Card
        title={
          <Space>
            <FileExcelOutlined style={{ color: '#1677ff' }} />
            <span>第一步：上传 Excel 文件</span>
          </Space>
        }
        extra={
          isCompleted ? (
            <a onClick={() => setCollapsed(true)}>
              <UpOutlined /> 收起
            </a>
          ) : null
        }
      >
        <FileUploader />
        {importProgress > 0 && importProgress < 100 && <ImportProgress />}
      </Card>
    </div>
  );
}
