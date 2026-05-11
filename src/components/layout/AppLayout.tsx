'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import { ImportOutlined, OrderedListOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <ImportOutlined />,
      label: '导入下单',
    },
    {
      key: '/orders',
      icon: <OrderedListOutlined />,
      label: '运单列表',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#1677ff',
            whiteSpace: 'nowrap',
          }}
        >
          万能导入
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ flex: 1, border: 'none' }}
        />
      </Header>
      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </Content>
    </Layout>
  );
}
