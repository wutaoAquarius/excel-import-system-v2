'use client';

import React from 'react';
import {
  Card,
  Result,
  Progress,
  Statistic,
  Row,
  Col,
  Table,
  Button,
  Space,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useImportStore } from '@/store/importStore';

const { Text } = Typography;

export default function ResultSection() {
  const { phase, submitProgress, submitResult, data, reset } = useImportStore();

  if (phase !== 'submitting' && phase !== 'result') return null;

  // 提交中：显示进度条
  if (phase === 'submitting') {
    const processed = Math.floor((submitProgress / 100) * data.length);
    return (
      <div className="section-card">
        <Card title="正在提交数据...">
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Progress
              type="circle"
              percent={Math.round(submitProgress)}
              size={120}
              strokeColor={{
                '0%': '#1677ff',
                '100%': '#52c41a',
              }}
            />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                已提交 {processed}/{data.length} 条
              </Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 提交完成：显示结果
  if (!submitResult) return null;

  const { total, success, failed, failedRows } = submitResult;
  const allSuccess = failed === 0;

  const failedColumns = [
    {
      title: '行号',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: '失败原因',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  return (
    <div className="section-card">
      <Card>
        <Result
          icon={
            allSuccess ? (
              <TrophyOutlined style={{ color: '#52c41a' }} />
            ) : (
              <CheckCircleOutlined style={{ color: '#faad14' }} />
            )
          }
          title={allSuccess ? '全部提交成功！' : '提交完成（部分失败）'}
          subTitle={`共提交 ${total} 条数据`}
          extra={
            <Space>
              {!allSuccess && (
                <Button icon={<DownloadOutlined />}>
                  导出失败数据
                </Button>
              )}
              {!allSuccess && (
                <Button icon={<ReloadOutlined />} type="primary">
                  重试失败数据
                </Button>
              )}
              <Button onClick={reset}>
                开始新的导入
              </Button>
            </Space>
          }
        />

        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总计提交"
                value={total}
                suffix="条"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="成功"
                value={success}
                suffix="条"
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="失败"
                value={failed}
                suffix="条"
                valueStyle={{ color: failed > 0 ? '#ff4d4f' : '#52c41a' }}
                prefix={failed > 0 ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {failedRows && failedRows.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Text strong style={{ marginBottom: 8, display: 'block' }}>
              失败详情：
            </Text>
            <Table
              columns={failedColumns}
              dataSource={failedRows.map((r) => ({ ...r, key: r.row }))}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
