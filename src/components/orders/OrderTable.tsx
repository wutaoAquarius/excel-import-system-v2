'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Modal,
  Descriptions,
  Spin,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface OrderRecord {
  id: number;
  externalCode: string | null;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  quantity: number;
  temperature: string;
  remark: string | null;
  createdAt: string;
}

interface OrderTableProps {
  filters: {
    externalCode: string;
    receiverName: string;
    dateRange: [string, string] | null;
  };
}

export default function OrderTable({ filters }: OrderTableProps) {
  const [data, setData] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (filters.externalCode) params.set('externalCode', filters.externalCode);
      if (filters.receiverName) params.set('receiverName', filters.receiverName);
      if (filters.dateRange) {
        params.set('startDate', filters.dateRange[0]);
        params.set('endDate', filters.dateRange[1]);
      }

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.data || []);
        setTotal(result.total || 0);
      }
    } catch {
      // API 不可用
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 筛选变化时回到第一页
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const statusMap: Record<string, { color: string; text: string }> = {
    success: { color: 'green', text: '成功' },
    pending: { color: 'orange', text: '待审核' },
    failed: { color: 'red', text: '失败' },
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      width: 90,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: '外部编码',
      dataIndex: 'externalCode',
      width: 130,
      render: (code: string | null) =>
        code ? <Text code>{code}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: '发件人',
      dataIndex: 'senderName',
      width: 100,
    },
    {
      title: '收件人',
      dataIndex: 'receiverName',
      width: 100,
    },
    {
      title: '收件人电话',
      dataIndex: 'receiverPhone',
      width: 130,
    },
    {
      title: '重量(kg)',
      dataIndex: 'weight',
      width: 90,
      sorter: (a: OrderRecord, b: OrderRecord) => Number(a.weight) - Number(b.weight),
    },
    {
      title: '件数',
      dataIndex: 'quantity',
      width: 70,
    },
    {
      title: '温层',
      dataIndex: 'temperature',
      width: 80,
      render: (temp: string) => {
        const colorMap: Record<string, string> = {
          '常温': 'default',
          '冷藏': 'blue',
          '冷冻': 'cyan',
        };
        return <Tag color={colorMap[temp] || 'default'}>{temp}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (date: string) => {
        try {
          return new Date(date).toLocaleString('zh-CN');
        } catch {
          return date;
        }
      },
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: OrderRecord) => (
        <a
          onClick={() => {
            setSelectedOrder(record);
            setDetailVisible(true);
          }}
        >
          <Space>
            <EyeOutlined /> 详情
          </Space>
        </a>
      ),
    },
  ];

  return (
    <>
      <Card
        title="运单列表"
        extra={<Text type="secondary">共 {total} 条</Text>}
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            scroll={{ x: 1300 }}
            size="middle"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t, range) =>
                `第 ${range[0]}-${range[1]} 条 / 共 ${t} 条`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={`运单详情 #${selectedOrder?.id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="订单号">#{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="外部编码">
              {selectedOrder.externalCode || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="发件人">{selectedOrder.senderName}</Descriptions.Item>
            <Descriptions.Item label="发件人电话">{selectedOrder.senderPhone}</Descriptions.Item>
            <Descriptions.Item label="发件人地址" span={2}>
              {selectedOrder.senderAddress}
            </Descriptions.Item>
            <Descriptions.Item label="收件人">{selectedOrder.receiverName}</Descriptions.Item>
            <Descriptions.Item label="收件人电话">{selectedOrder.receiverPhone}</Descriptions.Item>
            <Descriptions.Item label="收件人地址" span={2}>
              {selectedOrder.receiverAddress}
            </Descriptions.Item>
            <Descriptions.Item label="重量(kg)">{String(selectedOrder.weight)}</Descriptions.Item>
            <Descriptions.Item label="件数">{selectedOrder.quantity}</Descriptions.Item>
            <Descriptions.Item label="温层">
              <Tag>{selectedOrder.temperature}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {selectedOrder.remark || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}
