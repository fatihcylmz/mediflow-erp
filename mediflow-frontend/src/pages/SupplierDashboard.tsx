import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Badge } from 'antd';
import { TruckOutlined, ShoppingCartOutlined, CheckCircleOutlined, LineChartOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OrderItem {
  key: string;
  orderNo: string;
  pharmacy: string;
  total: string;
  status: string;
}

export default function SupplierDashboard() {
  const dataSource: OrderItem[] = [
    { key: '1', orderNo: 'ORD-2026-050', pharmacy: 'Merkez Eczanesi', total: '14,500 ₺', status: 'Hazırlanıyor' },
    { key: '2', orderNo: 'ORD-2026-051', pharmacy: 'Şifa Eczanesi', total: '8,200 ₺', status: 'Sevk Edildi' },
    { key: '3', orderNo: 'ORD-2026-052', pharmacy: 'Sağlık Eczanesi', total: '22,750 ₺', status: 'Kargoda' },
  ];

  const columns = [
    { title: 'Sipariş Kodu', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
    { title: 'Talep Eden Eczane', dataIndex: 'pharmacy', key: 'pharmacy', width: 180 },
    { title: 'Tutar', dataIndex: 'total', key: 'total', width: 100 },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        switch(status) {
          case 'Hazırlanıyor': return <Badge status="processing" text={<Text style={{ color: '#0ea5e9' }}>Hazırlanıyor</Text>} />;
          case 'Sevk Edildi': return <Badge status="success" text={<Text style={{ color: '#16a34a' }}>Sevk Edildi</Text>} />;
          case 'Kargoda': return <Badge status="warning" text={<Text style={{ color: '#d97706' }}>Kargoda</Text>} />;
          default: return <Badge status="default" text={status} />;
        }
      }
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Yeni Siparişler</Text>}
              value={8}
              prefix={<ShoppingCartOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Sevkiyatlar</Text>}
              value={4}
              prefix={<TruckOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Tamamlananlar</Text>}
              value={128}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Toplam Ciro</Text>}
              value={285}
              suffix={<span style={{ fontSize: 16 }}>B ₺</span>}
              prefix={<LineChartOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Card */}
      <Card
        className="border-0 shadow-sm rounded-xl bg-white"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClockCircleOutlined style={{ color: '#f97316', fontSize: 20 }} />
            <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Gelen Eczane Siparişleri</Title>
          </div>
        }
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowKey="key"
          bordered={false}
          size="middle"
          style={{ borderRadius: 12, overflow: 'hidden' }}
          className="rounded-xl"
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <LineChartOutlined style={{ fontSize: 40, color: '#d97706', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#92400e' }}>Yeni Sevkiyat</Title>
              <Text type="secondary">Siparişi hazırlayıp kargoya verin</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}>
              <ShoppingCartOutlined style={{ fontSize: 40, color: '#db2777', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#9d174d' }}>Sipariş Onayla</Title>
              <Text type="secondary">Gelen siparişleri inceleyin ve onaylayın</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              <CheckCircleOutlined style={{ fontSize: 40, color: '#059669', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#065f46' }}>Teslimat Takibi</Title>
              <Text type="secondary">Sevkiyat durumlarını takip edin</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}