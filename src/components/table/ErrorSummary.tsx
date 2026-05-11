'use client';

import React from 'react';
import { Alert, Collapse, List, Tag, Typography, Space, Badge } from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';
import { validateAllRows } from '@/lib/validation/validator';

const { Text } = Typography;

export default function ErrorSummary() {
  const { data, errors, setErrors } = useImportStore();

  // 监听 data 变化，自动执行全量校验
  React.useEffect(() => {
    if (data.length === 0) {
      setErrors([]);
      return;
    }
    const newErrors = validateAllRows(data);
    setErrors(newErrors);
  }, [data, setErrors]);

  if (errors.length === 0) {
    return (
      <Alert
        message="数据校验通过"
        description="所有数据格式正确，可以直接提交"
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        style={{ marginBottom: 16 }}
      />
    );
  }

  // 按行号分组
  const errorsByRow: Record<number, number> = {};
  errors.forEach((err) => {
    errorsByRow[err.rowIndex] = (errorsByRow[err.rowIndex] || 0) + 1;
  });
  const errorRowCount = Object.keys(errorsByRow).length;

  return (
    <div style={{ marginBottom: 16 }}>
      <Collapse
        defaultActiveKey={['errors']}
        items={[
          {
            key: 'errors',
            label: (
              <Space>
                <Badge count={errors.length} overflowCount={999}>
                  <ExclamationCircleOutlined
                    style={{ color: '#ff4d4f', fontSize: 18 }}
                  />
                </Badge>
                <Text strong style={{ color: '#ff4d4f' }}>
                  错误汇总（共 {errors.length} 个错误，涉及 {errorRowCount} 行，请修正后再提交）
                </Text>
              </Space>
            ),
            children: (
              <List
                size="small"
                dataSource={errors}
                renderItem={(err, index) => (
                  <List.Item style={{ cursor: 'pointer' }}>
                    <Space>
                      <Text type="secondary">{index + 1}.</Text>
                      <Tag color="red">第{err.rowIndex}行</Tag>
                      <Tag color="orange">{err.field}</Tag>
                      <Text>{err.message}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
