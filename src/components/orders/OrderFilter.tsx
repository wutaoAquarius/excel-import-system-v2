'use client';

import React from 'react';
import { Card, Form, Input, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface OrderFilterProps {
  filters: {
    externalCode: string;
    receiverName: string;
    dateRange: [string, string] | null;
  };
  onFilterChange: (filters: {
    externalCode: string;
    receiverName: string;
    dateRange: [string, string] | null;
  }) => void;
}

export default function OrderFilter({ onFilterChange }: OrderFilterProps) {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onFilterChange({
      externalCode: values.externalCode || '',
      receiverName: values.receiverName || '',
      dateRange: values.dateRange
        ? [
            values.dateRange[0]?.format('YYYY-MM-DD'),
            values.dateRange[1]?.format('YYYY-MM-DD'),
          ]
        : null,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({
      externalCode: '',
      receiverName: '',
      dateRange: null,
    });
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: 8 }}>
        <Form.Item label="外部编码" name="externalCode">
          <Input placeholder="精确/模糊搜索" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item label="收件人姓名" name="receiverName">
          <Input placeholder="模糊搜索" allowClear style={{ width: 160 }} />
        </Form.Item>
        <Form.Item label="提交时间" name="dateRange">
          <RangePicker style={{ width: 260 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
