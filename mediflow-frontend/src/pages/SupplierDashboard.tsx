import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Badge, Select, Segmented, Spin, Alert, Button } from 'antd';
import {
  ShopOutlined, ShoppingCartOutlined, MedicineBoxOutlined, ClockCircleOutlined,
  LineChartOutlined, TruckOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { TrendChart, DonutChart, FunnelChart, KPICard } from '../components/charts/DashboardCharts';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface OrderItem {
  key: string;
  orderNo: string;
  pharmacy: string;
  total: string;
  status: string;
}

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await api.post('/api/app/dashboard/get-stats');
      const d = statsRes.data?.data ?? statsRes.data;
      setStats({
        totalDrugs: d.totalDrugs ?? 0,
        pendingOrders: d.pendingOrders ?? 0,
        totalOrders: d.totalOrders ?? 0,
        totalSalesAmount: d.totalSalesAmount ?? 0,
        totalPrescriptions: d.totalPrescriptions ?? 0,
        criticalStockCount: d.criticalStockCount ?? 0,
      });

      const params = new URLSearchParams();
      params.append('period', period);
      const trendRes = await api.get(`/api/app/dashboard/trend?${params.toString()}`);
      const td = trendRes.data?.data ?? trendRes.data;
      setTrendData({
        dailySales: td.dailySales ?? [],
        dailyOrders: td.dailyOrders ?? [],
        categoryDistribution: td.categoryDistribution ?? [],
        stockDistribution: td.stockDistribution ?? [],
        totalSales: td.totalSales ?? 0,
        totalSalesAmount: td.totalSalesAmount ?? 0,
        totalOrders: td.totalOrders ?? 0,
      });
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError('Oturumunuz süresi dolmuş. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      setError('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      const trendRes = await api.get(`/api/app/dashboard/trend?${params.toString()}`);
      const td = trendRes.data?.data ?? trendRes.data;
      setTrendData({
        dailySales: td.dailySales ?? [],
        dailyOrders: td.dailyOrders ?? [],
        categoryDistribution: td.categoryDistribution ?? [],
        stockDistribution: td.stockDistribution ?? [],
        totalSales: td.totalSales ?? 0,
        totalSalesAmount: td.totalSalesAmount ?? 0,
        totalOrders: td.totalOrders ?? 0,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        switch (status) {
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
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

      {/* Başlık ve Filtre */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Tedarikçi Dashboard</h2>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 13 }}>Sipariş, sevkiyat ve fatura takibi</p>
          </div>
          <div className="flex items-center gap-3">
            <Segmented
              options={[
                { label: 'Günlük', value: 'day' },
                { label: 'Haftalık', value: 'week' },
                { label: 'Aylık', value: 'month' },
                { label: 'Yıllık', value: 'year' },
              ]}
              value={period}
              onChange={(val: any) => { setPeriod(val); handleFilterChange(); }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
          <Button type="primary" size="small" onClick={handleFilterChange} loading={loading}
            style={{ background: '#FF7A00', borderColor: '#FF7A00' }}>
            Güncelle
          </Button>
        </div>
      </div>

      {/* KPI Kartları */}
      {loading && !trendData ? (
        <div className="flex justify-center py-12"><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Yeni Siparişler" value={stats?.pendingOrders ?? 0} subtitle="Hazırlanan sipariş" color="#FF7A00" icon={<ShoppingCartOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Sevkiyatlar" value={stats?.totalOrders ?? 0} subtitle="Toplam sevkiyat" color="#1D4ED8" icon={<TruckOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Tamamlanan" value={trendData?.totalSales ?? 0} subtitle="Teslim edilen" color="#059669" icon={<CheckCircleOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Toplam Ciro" value={`${new Intl.NumberFormat('tr-TR').format(trendData?.totalSalesAmount ?? 0)} ₺`} subtitle="Satış tutarı" color="#059669" icon={<DollarOutlined />} />
            </Col>
          </Row>

          {/* Grafikler */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined style={{ color: '#059669' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Sipariş Durumu</span>
                  </div>
                }
              >
                <DonutChart
                  data={trendData?.categoryDistribution ?? [{ name: 'Hazırlanıyor', value: stats?.pendingOrders ?? 8 }, { name: 'Sevk Edildi', value: 12 }, { name: 'Kargoda', value: 4 }, { name: 'Teslim Edildi', value: 14 }]}
                  colorMap={{ "Hazırlanıyor": "#0ea5e9", "Sevk Edildi": "#16a34a", "Kargoda": "#d97706", "Teslim Edildi": "#059669" }}
                  size={160}
                  title="SİPARİŞ"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <TruckOutlined style={{ color: '#1D4ED8' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Sevkiyat / Funnel Analizi</span>
                  </div>
                }
              >
                <FunnelChart data={[
                  { name: 'Toplam Sipariş', value: trendData?.totalOrders ?? 38 },
                  { name: 'Onaylandı', value: Math.round((trendData?.totalOrders ?? 38) * 0.8), conversion: 80 },
                  { name: 'Sevk Edildi', value: Math.round((trendData?.totalOrders ?? 38) * 0.6), conversion: 60 },
                  { name: 'Teslim Edildi', value: Math.round((trendData?.totalOrders ?? 38) * 0.4), conversion: 40 },
                  { name: 'İptal Edilen', value: Math.round((trendData?.totalOrders ?? 38) * 0.1), conversion: 10 },
                ]} />
              </Card>
            </Col>
          </Row>

          {/* Trend Grafikleri */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <LineChartOutlined style={{ color: '#1D4ED8' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Sipariş Trendi</span>
                  </div>
                }
                extra={<span style={{ fontSize: 15, fontWeight: 700, color: '#FF7A00' }}>{trendData?.totalOrders ?? 0}</span>}
              >
                <TrendChart data={trendData?.dailyOrders ?? []} label="count" color="#FF7A00" height={200} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <DollarOutlined style={{ color: '#059669' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Ciro Trendi</span>
                  </div>
                }
                extra={<span style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8' }}>{new Intl.NumberFormat('tr-TR').format(trendData?.totalSalesAmount ?? 0)} ₺</span>}
              >
                <TrendChart data={trendData?.dailySales ?? []} label="amount" color="#1D4ED8" height={200} />
              </Card>
            </Col>
          </Row>

          {/* Tablo */}
          <Card
            className="shadow-sm rounded-xl"
            styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined style={{ color: '#f97316' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Gelen Eczane Siparişleri</span>
              </div>
            }
          >
            <Table<OrderItem>
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey="key"
              size="middle"
              locale={{ emptyText: <Text type="secondary">Henüz sipariş bulunmuyor.</Text> }}
            />
          </Card>

          {/* Quick Actions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/supplier/shipments')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                  <TruckOutlined style={{ fontSize: 36, color: '#d97706', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#92400e', fontWeight: 700 }}>Yeni Sevkiyat</Title>
                  <Text type="secondary">Siparişi hazırlayıp kargoya verin</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/supplier/orders')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}>
                  <ShoppingCartOutlined style={{ fontSize: 36, color: '#db2777', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#9d174d', fontWeight: 700 }}>Sipariş Onayla</Title>
                  <Text type="secondary">Gelen siparişleri inceleyin ve onaylayın</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/supplier/invoices')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                  <CheckCircleOutlined style={{ fontSize: 36, color: '#059669', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#065f46', fontWeight: 700 }}>Teslimat Takibi</Title>
                  <Text type="secondary">Sevkiyat durumlarını takip edin</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
