'use client';

import React from 'react';
import { Table, Button, Space, Popconfirm, message, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';
import EditableCell from './EditableCell';
import type { OrderRow } from '@/types/order';

const { Text } = Typography;

/** 定义表格列配置 */
const COLUMN_CONFIG: {
  title: string;
  dataIndex: keyof OrderRow;
  width: number;
  fixed?: 'left' | 'right';
}[] = [
  { title: '行号', dataIndex: 'rowIndex', width: 70, fixed: 'left' },
  { title: '发件人姓名', dataIndex: 'senderName', width: 120 },
  { title: '发件人电话', dataIndex: 'senderPhone', width: 140 },
  { title: '发件人地址', dataIndex: 'senderAddress', width: 220 },
  { title: '收件人姓名', dataIndex: 'receiverName', width: 120 },
  { title: '收件人电话', dataIndex: 'receiverPhone', width: 140 },
  { title: '收件人地址', dataIndex: 'receiverAddress', width: 220 },
  { title: '重量(kg)', dataIndex: 'weight', width: 100 },
  { title: '件数', dataIndex: 'quantity', width: 80 },
  { title: '温层', dataIndex: 'temperature', width: 90 },
  { title: '外部编码', dataIndex: 'externalCode', width: 120 },
  { title: '备注', dataIndex: 'remark', width: 150 },
];

export default function DataTable() {
  const { data, errors, setData } = useImportStore();
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);

  // 获取单元格的错误信息
  const getCellError = (rowIndex: number, field: string): string | undefined => {
    const fieldMap: Record<string, string> = {
      senderName: '发件人姓名',
      senderPhone: '发件人电话',
      senderAddress: '发件人地址',
      receiverName: '收件人姓名',
      receiverPhone: '收件人电话',
      receiverAddress: '收件人地址',
      weight: '重量',
      quantity: '件数',
      temperature: '温层',
      externalCode: '外部编码',
      remark: '备注',
    };
    const fieldName = fieldMap[field];
    if (!fieldName) return undefined;
    const err = errors.find(
      (e) => e.rowIndex === rowIndex && e.field === fieldName
    );
    return err?.message;
  };

  // 处理单元格编辑
  const handleCellChange = (
    rowKey: string,
    field: keyof OrderRow,
    value: string
  ) => {
    const newData = data.map((row) => {
      if (row.key === rowKey) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setData(newData);
  };

  // 删除选中行
  const handleDeleteSelected = () => {
    const newData = data.filter((row) => !selectedRowKeys.includes(row.key));
    setData(newData);
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 行`);
  };

  // 新增空行
  const handleAddRow = () => {
    const newRow: OrderRow = {
      key: `row-new-${Date.now()}`,
      rowIndex: data.length + 1,
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      weight: '',
      quantity: '',
      temperature: '',
      externalCode: '',
      remark: '',
    };
    setData([...data, newRow]);
    message.success('已添加新行');
  };

  // 构建 Table 列
  const columns: any[] = COLUMN_CONFIG.map((col) => {
    if (col.dataIndex === 'rowIndex') {
      return {
        title: col.title,
        dataIndex: col.dataIndex,
        width: col.width,
        fixed: col.fixed,
        render: (val: number) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {val}
          </Text>
        ),
      };
    }

    return {
      title: col.title,
      dataIndex: col.dataIndex,
      width: col.width,
      fixed: col.fixed,
      render: (val: string | number, record: OrderRow) => {
        const error = getCellError(record.rowIndex, col.dataIndex);
        return (
          <EditableCell
            value={val}
            error={error}
            onChange={(newVal) =>
              handleCellChange(record.key, col.dataIndex, newVal)
            }
          />
        );
      },
    };
  });

  // 操作列
  columns.push({
    title: '操作',
    dataIndex: 'action',
    width: 80,
    fixed: 'right',
    render: (_: unknown, record: OrderRow) => (
      <Popconfirm
        title="确定删除此行？"
        onConfirm={() => {
          setData(data.filter((r) => r.key !== record.key));
          message.success('已删除');
        }}
      >
        <Button type="link" danger size="small" icon={<DeleteOutlined />} />
      </Popconfirm>
    ),
  });

  return (
    <div>
      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Text type="secondary">共 {data.length} 条数据</Text>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 行？`}
              onConfirm={handleDeleteSelected}
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                删除选中 ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </Space>
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={handleAddRow}
        >
          新增行
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        virtual
        columns={columns}
        dataSource={data}
        rowKey="key"
        scroll={{ x: 1800, y: 500 }}
        pagination={false}
        size="small"
        bordered
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        sticky
      />

      {/* 键盘操作提示 */}
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          点击单元格编辑 | Tab 跳到右侧 | Enter 跳到下一行 | Esc 取消
        </Text>
      </div>
    </div>
  );
}
