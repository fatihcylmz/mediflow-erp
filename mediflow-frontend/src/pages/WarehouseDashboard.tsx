import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Badge } from 'antd';
import { DatabaseOutlined, InboxOutlined, WarningOutlined, LineChartOutlined, BoxPlotOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface StockItem {
  key: string;
  batchNo: string;
  drug: string;
  stock: string;
  location: string;
}

export default function WarehouseDashboard() {
  const dataSource: StockItem[] = [
    { key: '1', batchNo: 'BATCH-9901', drug: 'Aspirin 100mg', stock: '12,000 Kutu', location: 'Raf A-12' },
    { key: '2', batchNo: 'BATCH-9902', drug: 'Coraspin 300mg', stock: '4,500 Kutu', location: 'Raf B-04' },
    { key: '3', batchNo: 'BATCH-9903', drug: 'Neomisin', stock: '8,200 Kutu', location: 'Raf C-08' },
  ];

  const columns = [
    { title: 'Parti / Batch No', dataIndex: 'batchNo', key: 'batchNo', width: 150 },
    { title: 'İlaç Adı', dataIndex: 'drug', key: 'drug', width: 180 },
    {
      title: 'Stok Durumu',
      dataIndex: 'stock',
      key: 'stock',
      width: 150,
      render: (stock: string) => {
        const qty = parseInt(stock.replace(/\D/g, ''));
        if (qty < 5000) {
          return <Badge status="error" text={<Text style={{ color: '#dc2626', fontWeight: 600 }}>{stock}</Text>} />;
        } else if (qty < 10000) {
          return <Badge status="warning" text={<Text style={{ color: '#d97706', fontWeight: 600 }}>{stock}</Text>} />;
        }
        return <Badge status="success" text={<Text style={{ color: '#16a34a', fontWeight: 600 }}>{stock}</Text>} />;
      }
    },
    { title: 'Depo Konumu', dataIndex: 'location', key: 'location', width: 120 },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Toplam Stok Kalemi</Text>}
              value={1420}
              prefix={<DatabaseOutlined style={{ color: 'white' }} />}
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
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Kritik Stok Seviyesi</Text>}
              value={12}
              prefix={<WarningOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Günlük Çıkışlar</Text>}
              value={85}
              prefix={<InboxOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
              suffix={<span style={{ fontSize: 14, opacity: 0.9 }}> adet</span>}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border-0 shadow-sm rounded-xl"
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Raf Doluluğu</Text>}
              value={78}
              prefix={<BoxPlotOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
              suffix={<span style={{ fontSize: 14, opacity: 0.9 }}>%</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Card */}
      <Card
        className="border-0 shadow-sm rounded-xl bg-white"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BoxPlotOutlined style={{ color: '#6366f1', fontSize: 20 }} />
            <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Ana Depo Stok Durumu</Title>
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
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
              <InboxOutlined style={{ fontSize: 40, color: '#7c3aed', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#4c1d95' }}>Stok Girişi</Title>
              <Text type="secondary">Yeni ürün girişini kaydedin</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
              <WarningOutlined style={{ fontSize: 40, color: '#dc2626', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#991b1b' }}>Uyarıları Görüntüle</Title>
              <Text type="secondary">{12} kritik stok uyarısı mevcut</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              <LineChartOutlined style={{ fontSize: 40, color: '#059669', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '16px 0 8px', color: '#065f46' }}>Stok Hareketleri</Title>
              <Text type="secondary">Gün içi çıkış/giriş hareketlerini görüntüleyin</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}