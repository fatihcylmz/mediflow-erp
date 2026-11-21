import React from 'react';
import { Layout, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
      <Layout.Content>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80,
              height: 80,
              background: '#800020',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 32px rgba(128, 0, 32, 0.2)'
            }}>
              <SafetyCertificateOutlined style={{ fontSize: 40, color: '#fff' }} />
            </div>
            <Title level={2} style={{ color: '#800020', fontWeight: 700, marginBottom: 8 }}>
              MediFlow ERP
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Yeni Nesil Sağlık ve Tedarik Zinciri Yönetimi
            </Text>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 4px 24px rgba(128, 0, 32, 0.12)',
            border: '1px solid rgba(128, 0, 32, 0.1)'
          }}>
            {children}
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
}