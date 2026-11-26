import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Badge, Select, Segmented, Spin, Alert, Button } from 'antd';
import {
  ShopOutlined, ShoppingCartOutlined, MedicineBoxOutlined, ClockCircleOutlined,
  LineChartOutlined, AlertOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { TrendChart, DonutChart, FunnelChart, KPICard } from '../components/charts/DashboardCharts';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [pharmacies, setPharmacies] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stats
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

      // Fetch trend data
      const params = new URLSearchParams();
      params.append('period', period);
      if (selectedPharmacyId) params.append('pharmacyId', selectedPharmacyId);
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

      // Fetch pharmacy list for filter
      const pharmRes = await api.get<any>('/api/app/pharmacy?skipCount=0&maxResultCount=100');
      const items = pharmRes?.data?.data?.items ?? pharmRes?.data?.items ?? [];
      setPharmacies(items.map((p: any) => ({ id: p.id, name: p.name })));
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
      if (selectedPharmacyId) params.append('pharmacyId', selectedPharmacyId);
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
        switch (status) {
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
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

      {/* Başlık ve Filtre */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Eczane Dashboard</h2>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 13 }}>Reçete, sipariş ve stok analizleri</p>
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

        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-[#F1F5F9]">
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Eczane:</span>
          <Select
            style={{ width: 200 }}
            placeholder="Tüm Eczaneler"
            allowClear
            showSearch
            value={selectedPharmacyId || undefined}
            onChange={val => { setSelectedPharmacyId(val as string); handleFilterChange(); }}
            options={pharmacies.map(p => ({ value: p.id, label: p.name }))}
          />
          <Button type="primary" size="small" onClick={handleFilterChange} loading={loading}
            style={{ background: '#FF7A00', borderColor: '#FF7A00', marginLeft: 8 }}>
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
            <Col xs={24} sm={12} xl={4}>
              <KPICard title="Toplam İlaç Çeşidi" value={stats?.totalDrugs ?? 0} subtitle="Envanter" color="#1D4ED8" icon={<MedicineBoxOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <KPICard title="Aktif Sipariş" value={stats?.pendingOrders ?? 0} subtitle="Stokta Beklemede" color="#FF7A00" icon={<ShoppingCartOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <KPICard title="Satış Tutarı" value={`${new Intl.NumberFormat('tr-TR').format(stats?.totalSalesAmount ?? 0)} ₺`} subtitle="Güncel Ciro" color="#059669" icon={<DollarOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <KPICard title="Toplam Reçete" value={stats?.totalPrescriptions ?? 0} subtitle="Reçeteler" color="#DC2626" icon={<FileTextOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <KPICard title="Kritik Stok" value={stats?.criticalStockCount ?? 0} subtitle="Uyarılar" color="#DC2626" icon={<AlertOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={4}>
              <KPICard title="Toplam Satış" value={trendData?.totalSales ?? 0} subtitle="Adet" color="#1D4ED8" icon={<LineChartOutlined />} />
            </Col>
          </Row>

          {/* Grafikler - Donut ve Funnel */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined style={{ color: '#059669' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Reçete Türü Dağılımı</span>
                  </div>
                }
              >
                <DonutChart data={trendData?.categoryDistribution ?? []} size={160} title="REÇETE" />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <LineChartOutlined style={{ color: '#1D4ED8' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Satış / Funnel Analizi</span>
                  </div>
                }
              >
                <FunnelChart data={[
                  { name: 'Toplam Sipariş', value: trendData?.totalOrders ?? 0 },
                  { name: 'Tamamlanan', value: Math.round((trendData?.totalOrders ?? 0) * 0.8) },
                  { name: 'Onaylanan', value: Math.round((trendData?.totalOrders ?? 0) * 0.6) },
                  { name: 'Sevk Edilen', value: Math.round((trendData?.totalOrders ?? 0) * 0.4) },
                  { name: 'Teslim Edilen', value: Math.round((trendData?.totalOrders ?? 0) * 0.3) },
                  { name: 'Tamamlanan Satış', value: trendData?.totalSales ?? 0 },
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
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Satış Trendi</span>
                  </div>
                }
                extra={<span style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8' }}>{new Intl.NumberFormat('tr-TR').format(trendData?.totalSalesAmount ?? 0)} ₺</span>}
              >
                <TrendChart data={trendData?.dailySales ?? []} label="amount" color="#1D4ED8" height={200} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <ShoppingCartOutlined style={{ color: '#FF7A00' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Sipariş Trendi</span>
                  </div>
                }
                extra={<span style={{ fontSize: 15, fontWeight: 700, color: '#FF7A00' }}>{trendData?.totalOrders ?? 0}</span>}
              >
                <TrendChart data={trendData?.dailyOrders ?? []} label="count" color="#FF7A00" height={200} />
              </Card>
            </Col>
          </Row>

          {/* Tablo */}
          <Card
            className="shadow-sm rounded-xl"
            styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined style={{ color: '#ec4899' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Son Eczane İşlemleri</span>
              </div>
            }
          >
            <Table<OrderItem>
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey="key"
              size="middle"
              locale={{ emptyText: <Text type="secondary">Henüz işlem bulunmuyor.</Text> }}
            />
          </Card>

          {/* Quick Actions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0, borderRadius: 12 } }}
                onClick={() => navigate('/pharmacy/orders')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
                  <ShoppingCartOutlined style={{ fontSize: 36, color: '#0ea5e9', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#0c4a6e', fontWeight: 700 }}>Yeni Sipariş</Title>
                  <Text type="secondary">Stok kontrolü yaparak yeni sipariş oluşturun</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0, borderRadius: 12 } }}
                onClick={() => navigate('/pharmacy/prescriptions')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)' }}>
                  <MedicineBoxOutlined style={{ fontSize: 36, color: '#8b5cf6', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#5b21b6', fontWeight: 700 }}>Reçete Göster</Title>
                  <Text type="secondary">E-reçete bilgilerini görüntüleyin</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0, borderRadius: 12 } }}
                onClick={() => navigate('/admin/dashboard')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                  <LineChartOutlined style={{ fontSize: 36, color: '#d97706', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#92400e', fontWeight: 700 }}>Satış Raporu</Title>
                  <Text type="secondary">Günlük/haftalık satış performansını inceleyin</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
