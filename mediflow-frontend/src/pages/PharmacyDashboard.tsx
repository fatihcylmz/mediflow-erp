import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Badge } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, MedicineBoxOutlined, ClockCircleOutlined, LineChartOutlined, AlertOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OrderItem {
  key: string;
  orderNo: string;
  drug: string;
  qty: number;
  status: string;
  date: string;
}

export default function PharmacyDashboard() {
  const dataSource: OrderItem[] = [
    { key: '1', orderNo: 'ORD-2026-001', drug: 'Parol 500mg', qty: 50, status: 'Onaylandı', date: '2026-11-17' },
    { key: '2', orderNo: 'ORD-2026-002', drug: 'Avelox 400mg', qty: 20, status: 'Kargoda', date: '2026-11-16' },
    { key: '3', orderNo: 'ORD-2026-003', drug: 'Neocitrat', qty: 30, status: 'Beklemede', date: '2026-11-15' },
  ];

  const columns = [
    { title: 'Sipariş No', dataIndex: 'orderNo', key: 'orderNo', width: 120 },
    { title: 'İlaç Adı', dataIndex: 'drug', key: 'drug', width: 150 },
    { title: 'Miktar', dataIndex: 'qty', key: 'qty', width: 80 },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        switch(status) {
          case 'Onaylandı': return <Badge status="success" text={<Text style={{ color: '#16a34a' }}>Onaylandı</Text>} />;
          case 'Kargoda': return <Badge status="processing" text={<Text style={{ color: '#0ea5e9' }}>Kargoda</Text>} />;
          case 'Beklemede': return <Badge status="warning" text={<Text style={{ color: '#d97706' }}>Beklemede</Text>} />;
          default: return <Badge status="default" text={status} />;
        }
      }
    },
    { title: 'Tarih', dataIndex: 'date', key: 'date', width: 100 },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Aktif Reçeteler</Text>}
              value={14}
              prefix={<ShopOutlined style={{ color: 'white' }} />}
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
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Bekleyen Siparişler</Text>}
              value={3}
              prefix={<ShoppingCartOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Düşük Stok</Text>}
              value={5}
              prefix={<AlertOutlined style={{ color: 'white' }} />}
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
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Bugünkü Satış</Text>}
              value={47}
              prefix={<MedicineBoxOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
              suffix={<span style={{ fontSize: 14, opacity: 0.9 }}> ₺</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Card */}
      <Card
        className="border-0 shadow-sm rounded-xl bg-white"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClockCircleOutlined style={{ color: '#ec4899', fontSize: 20 }} />
            <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Son Eczane İşlemleri</Title>
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
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
              <ShoppingCartOutlined style={{ fontSize: 40, color: '#0ea5e9', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#0c4a6e' }}>Yeni Sipariş</Title>
              <Text type="secondary">Stok kontrolü yaparak yeni sipariş oluşturun</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)' }}>
              <MedicineBoxOutlined style={{ fontSize: 40, color: '#8b5cf6', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#5b21b6' }}>Reçete Göster</Title>
              <Text type="secondary">E-reçete bilgilerini görüntüleyin</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <LineChartOutlined style={{ fontSize: 40, color: '#d97706', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#92400e' }}>Satış Raporu</Title>
              <Text type="secondary">Günlük/haftalık satış performansını inceleyin</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}