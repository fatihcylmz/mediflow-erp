import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Badge, Spin, Alert } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, MedicineBoxOutlined, ClockCircleOutlined, LineChartOutlined, AlertOutlined, DollarOutlined, TruckOutlined } from '@ant-design/icons';

import { TrendChart, DonutChart, FunnelChart } from '../components/DashboardCharts';

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
      {/* Ana grafik tabı */}
      <div>
        <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Tedarikçi Dashboard</h2>
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
            placeholder="Tedarikçi"
          >
            <Select.Option value="1">Tedarikçi 1</Select.Option>
            <Select.Option value="2">Tedarikçi 2</Select.Option>
            <Select.Option value="3">Tedarikçi 3</Select.Option>
          </Select>
        </div>

        {/* KPI Kartları */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Yeni Siparişler</div>
                <div className="text-xl font-bold text-orange-600">{8}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Hazırlanan sipariş sayısı</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sevkiyatlar</div>
                <div className="text-xl font-bold text-blue-600">{4}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Kargoya gönderilen sevkiyat</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tamamlananlar</div>
                <div className="text-xl font-bold text-emerald-600">{128}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Başarıyla teslim edilen</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Toplam Ciro</div>
                <div className="text-xl font-bold text-emerald-600">{285 ₺}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Toplam satış tutarı</div>
            </Card>
          </Col>
        </Row>

        {/* Grafikler - Donut ve Funnel */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><FileTextOutlined className="text-emerald-600" /><span>Sipariş Durumu</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 300 }}>
              <div className="p-4" style={{ height: 240 }}>
                <DonutChart data={[
                  { name: 'Hazırlanıyor', value: 8 },
                  { name: 'Sevk Edildi', value: 12 },
                  { name: 'Kargoda', value: 4 },
                  { name: 'Teslim Edildi', value: 14 },
                ]} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><TruckOutlined className="text-blue-600" /><span>Sevkiyat / Funnel Analizi</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 400 }}>
              <div className="p-4" style={{ height: 340 }}>
                {1 && <FunnelChart data={[
                  { name: 'Toplam Sipariş', value: 38 },
                  { name: 'Onaylandı', value: 30 },
                  { name: 'Sevk Edildi', value: 22 },
                  { name: 'Teslim Edildi', value: 18 },
                  { name: 'İptal Edilen', value: 4 },
                ]} />}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Trend Grafikleri - Çizgi grafikler yan yana */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><LineChartOutlined className="text-blue-600" /><span>Sipariş Trendi</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 280 }}>
              <div className="p-4" style={{ height: 220 }}>
                {1 && <TrendChart data={[{ date: 'Ağu', count: 35 }, { date: 'Eyl', count: 48 }, { date: 'Eki', count: 42 }, { date: 'Kas', count: 55 }], label: "count"} color="#FF7A00" />}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            <Card bordered={false} title={<div className="flex items-center gap-2"><ShoppingCartOutlined className="text-orange-500" /><span>Fiyat Analizi</span></div>} className="shadow-sm rounded-xl overflow-hidden" style={{ height: 280 }}>
              <div className="p-4" style={{ height: 220 }}>
                {1 && <TrendChart data={[{ date: 'Ağu', amount: 2400 }, { date: 'Eyl', amount: 3100 }, { date: 'Eki', amount: 2800 }, { date: 'Kas', amount: 3500 }], label: "amount"} color="#1D4ED8" />}
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