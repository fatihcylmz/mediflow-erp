import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Badge, Spin, Alert } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, MedicineBoxOutlined, ClockCircleOutlined, LineChartOutlined, AlertOutlined, DollarOutlined } from '@ant-design/icons';

import { TrendChart, DonutChart, FunnelChart } from '../components/DashboardCharts';

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
      {/* Ana grafik tabı */}
      <div>
        <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Eczane Dashboard</h2>
        <div style={{ color: '#64748B', marginBottom: 16 }}>
          <Select
            style={{ width: 180, marginRight: 8 }}
            placeholder="Dönem"
          >
            <Select.Option value="day">Günlük</Select.Option>
            <Select.Option value="week">Haftalık</Select.Option>
            <Select.Option value="month">Aylık</Select.Option>
            <Select.Option value="year">Yıllık</Select.Option>
          </Select>
          <Select
            style={{ width: 180, marginRight: 8 }}
            placeholder="Eczane"
          >
            <Select.Option value="1">Eczane 1</Select.Option>
            <Select.Option value="2">Eczane 2</Select.Option>
            <Select.Option value="3">Eczane 3</Select.Option>
          </Select>
        </div>

        {/* KPI Kartları */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Toplam İlaç Çeşidi</div>
                <div className="text-xl font-bold text-blue-600">{14}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">İlaç Envanteri</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aktif Sipariş</div>
                <div className="text-xl font-bold text-orange-600">{3}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Stokta Beklemede</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Satış Tutar</div>
                <div className="text-xl font-bold text-emerald-600">{47 ₺}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Güncel Ciro</div>
            </Card>
          </Col>
        </Row>

        {/* Grafikler - Donut ve Funnel */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><FileTextOutlined className="text-emerald-600" /><span>Reçete Türü Dağılımı</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 300 }}>
              <div className="p-4" style={{ height: 240 }}>
                <DonutChart data={[
                  { name: 'Reçetesiz(OTC)', value: 8 },
                  { name: 'Beyaz Reçete', value: 5 },
                  { name: 'Yeşil Reçete', value: 4 },
                  { name: 'Kırmızı Reçete', value: 2 },
                ]} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><DollarOutlined className="text-emerald-600" /><span>Satış / Funnel Analizi</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 400 }}>
              <div className="p-4" style={{ height: 340 }}>
                {1 && <FunnelChart data={[
                  { name: 'Toplam Sipariş', value: 23 },
                  { name: 'Tamamlanan', value: 18 },
                  { name: 'Onaylanan', value: 14 },
                  { name: 'Sevk Edilen', value: 10 },
                  { name: 'Teslim Edilen', value: 8 },
                  { name: 'Tamamlanan Satış', value: 14 },
                ]} />}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Trend Grafikleri - Çizgi grafikler yan yana */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><LineChartOutlined className="text-blue-600" /><span>Satış Trendi</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 280 }}>
              <div className="p-4" style={{ height: 220 }}>
                <div style={{ height: 220 }}>
                  {1 && <TrendChart data={[{ date: 'Ağu', amount: 2400 }, { date: 'Eyl', amount: 3100 }, { date: 'Eki', amount: 2800 }, { date: 'Kas', amount: 3500 }], label: "amount"} color="#1D4ED8" />}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><ShoppingCartOutlined className="text-orange-500" /><span>Sipariş Trendi</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 280 }}>
              <div className="p-4" style={{ height: 220 }}>
                {1 && <TrendChart data={[{ date: 'Ağu', count: 35 }, { date: 'Eyl', count: 48 }, { date: 'Eki', count: 42 }, { date: 'Kas', count: 55 }], label: "count"} color="#FF7A00" />}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Tablo verileri */}
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