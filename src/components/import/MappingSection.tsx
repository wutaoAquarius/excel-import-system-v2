'use client';

import React from 'react';
import {
  Card,
  Table,
  Select,
  Tag,
  Button,
  Space,
  Alert,
  Typography,
  message,
} from 'antd';
import {
  LinkOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UpOutlined,
  DownOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';
import { applyMapping } from '@/lib/excel/applyMapping';
import { REQUIRED_FIELDS, ALL_SYSTEM_FIELDS } from '@/lib/constants';
import type { ColumnMapping } from '@/types/template';
import type { SystemField } from '@/types/order';

const { Text } = Typography;

export default function MappingSection() {
  const {
    phase,
    mappings,
    setMappings,
    setPhase,
    setData,
    rawRows,
    addressParts,
    fingerprint,
    usedHistoryTemplate,
  } = useImportStore();

  const [collapsed, setCollapsed] = React.useState(false);

  const isCompleted = phase !== 'upload' && phase !== 'mapping';
  const isVisible = phase !== 'upload';

  React.useEffect(() => {
    if (isCompleted) setCollapsed(true);
  }, [isCompleted]);

  if (!isVisible) return null;

  // 收缩状态
  if (collapsed && isCompleted) {
    const matchedCount = mappings.filter((m) => m.targetField).length;
    return (
      <div className="section-card">
        <div className="section-summary" onClick={() => setCollapsed(false)}>
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <LinkOutlined style={{ color: '#52c41a' }} />
            <Text strong>列映射完成</Text>
            <Tag color="green">已映射 {matchedCount} 个字段</Tag>
            {usedHistoryTemplate && (
              <Tag color="purple" icon={<HistoryOutlined />}>
                使用历史模板
              </Tag>
            )}
          </Space>
          <DownOutlined style={{ color: '#999' }} />
        </div>
      </div>
    );
  }

  // 处理映射变更
  const handleMappingChange = (index: number, targetField: string | null) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      targetField,
      isAutoMatched: false,
      confidence: targetField ? 1 : 0,
    };
    setMappings(newMappings);
  };

  // 检查必填字段是否全部映射
  const mappedFields = mappings
    .filter((m) => m.targetField)
    .map((m) => m.targetField);
  const missingRequired = REQUIRED_FIELDS.filter(
    (f) => !mappedFields.includes(f)
  );

  // 确认映射
  const handleConfirm = async () => {
    if (missingRequired.length > 0) {
      message.error(`以下必填字段未映射：${missingRequired.join('、')}`);
      return;
    }

    // 重新应用映射生成数据
    const mappedData = applyMapping(rawRows, mappings, addressParts);
    setData(mappedData);

    // 保存模板映射到服务端（模板记忆学习）
    if (fingerprint) {
      const mappingRules: Record<string, string> = {};
      mappings.forEach((m) => {
        if (m.targetField) {
          mappingRules[m.sourceColumn] = m.targetField;
        }
      });
      try {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fingerprint,
            headerNames: mappings.map((m) => m.sourceColumn),
            mappingRules,
          }),
        });
      } catch {
        // 保存失败不阻塞流程
      }
    }

    message.success('映射确认完成，模板已保存');
    setPhase('preview');
  };

  // 已映射的字段（用于下拉排除）
  const usedFields = mappings
    .filter((m) => m.targetField)
    .map((m) => m.targetField);

  const columns = [
    {
      title: 'Excel 列名',
      dataIndex: 'sourceColumn',
      key: 'sourceColumn',
      width: 200,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '映射方式',
      key: 'status',
      width: 140,
      render: (_: unknown, record: ColumnMapping) => {
        if (!record.targetField) {
          return (
            <Tag color="orange" icon={<WarningOutlined />}>
              未识别
            </Tag>
          );
        }
        if (record.isAutoMatched) {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              自动识别 ({Math.round(record.confidence * 100)}%)
            </Tag>
          );
        }
        return <Tag color="blue">手动映射</Tag>;
      },
    },
    {
      title: '系统字段',
      key: 'targetField',
      width: 200,
      render: (_: unknown, record: ColumnMapping, index: number) => (
        <Select
          value={record.targetField}
          onChange={(value) => handleMappingChange(index, value)}
          placeholder="选择对应字段"
          allowClear
          style={{ width: '100%' }}
          options={ALL_SYSTEM_FIELDS.map((f) => ({
            value: f,
            label: f,
            disabled: usedFields.includes(f) && record.targetField !== f,
          }))}
        />
      ),
    },
    {
      title: '是否必填',
      key: 'required',
      width: 80,
      render: (_: unknown, record: ColumnMapping) => {
        if (!record.targetField) return '-';
        const isRequired = REQUIRED_FIELDS.includes(
          record.targetField as SystemField
        );
        return isRequired ? <Tag color="red">必填</Tag> : <Tag>选填</Tag>;
      },
    },
  ];

  return (
    <div className="section-card">
      <Card
        title={
          <Space>
            <LinkOutlined style={{ color: '#1677ff' }} />
            <span>第二步：确认列映射</span>
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
        {usedHistoryTemplate && (
          <Alert
            message="已自动应用历史模板映射规则"
            description="系统检测到此 Excel 的表头格式与历史记录匹配，已自动应用之前的映射规则。你也可以手动调整。"
            type="info"
            showIcon
            icon={<HistoryOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}

        {missingRequired.length > 0 && (
          <Alert
            message={`以下必填字段尚未映射：${missingRequired.join('、')}`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={mappings}
          rowKey="sourceColumn"
          pagination={false}
          size="middle"
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => useImportStore.getState().reset()}>
              重新上传
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={missingRequired.length > 0}
            >
              确认映射并预览数据
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}
