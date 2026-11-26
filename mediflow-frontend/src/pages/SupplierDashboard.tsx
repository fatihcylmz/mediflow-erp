import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Badge, Select, Segmented, Spin, Alert, Button } from 'antd';
import {
  ShopOutlined, ShoppingCartOutlined, MedicineBoxOutlined, ClockCircleOutlined,
  LineChartOutlined, TruckOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined,
  InboxOutlined, BarChartOutlined
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

interface Warehouse {
  id: string;
  name: string;
  locationAddress?: string;
}

interface Shipment {
  id: string;
  warehouseId?: string;
  warehouseName?: string;
  status: number;
  trackingNumber: string;
}

interface Invoice {
  id: string;
  warehouseId?: string;
  warehouseName?: string;
  status: number;
  grandTotal: number;
}

interface Order {
  id: string;
  warehouseId?: string;
  warehouseName?: string;
  status: number;
}

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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

      // Fetch warehouse-based data for supplier dashboard
      const [warehouseRes, shipmentRes, invoiceRes, orderRes] = await Promise.all([
        api.get('/api/app/warehouse').catch(() => ({ data: { items: [] } })),
        api.get('/api/app/shipment').catch(() => ({ data: { items: [] } })),
        api.get('/api/app/invoice').catch(() => ({ data: { items: [] } })),
        api.get('/api/app/order').catch(() => ({ data: { items: [] } }))
      ]);
      setWarehouses(warehouseRes.data.items || []);
      setShipments(shipmentRes.data.items || []);
      setInvoices(invoiceRes.data.items || []);
      setOrders(orderRes.data.items || []);
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

  // Compute warehouse-based metrics
  const getWarehouseMetrics = () => {
    const warehouseMetrics = warehouses.map(w => {
      const whShipments = shipments.filter(s => s.warehouseId === w.id);
      const whInvoices = invoices.filter(i => i.warehouseId === w.id);
      const whOrders = orders.filter(o => o.warehouseId === w.id);

      return {
        warehouse: w,
        totalOrders: whOrders.length,
        pendingOrders: whOrders.filter(o => o.status === 0).length,
        totalShipments: whShipments.length,
        deliveredShipments: whShipments.filter(s => s.status === 2).length,
        totalInvoices: whInvoices.length,
        paidInvoices: whInvoices.filter(i => i.status === 2).length,
        totalRevenue: whInvoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0),
      };
    });
    return warehouseMetrics;
  };

  const warehouseMetrics = getWarehouseMetrics();

  // Aggregate KPIs for supplier
  const supplierKPIs = {
    totalWarehouses: warehouses.length,
    activeWarehouses: warehouseMetrics.filter(m => m.totalOrders > 0).length,
    totalShipments: shipments.length,
    deliveredShipments: shipments.filter(s => s.status === 2).length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 2).length,
    totalRevenue: invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0),
  };

  // Shipment status distribution for funnel
  const shipmentStatusDist = [
    { name: 'Toplam Sevkiyat', value: shipments.length },
    { name: 'Hazırlanıyor', value: shipments.filter(s => s.status === 0).length },
    { name: 'Yola Çıktı', value: shipments.filter(s => s.status === 1).length },
    { name: 'Teslim Edildi', value: shipments.filter(s => s.status === 2).length },
    { name: 'İptal', value: shipments.filter(s => s.status === 3).length },
  ];

  // Invoice status distribution for donut
  const invoiceStatusDist = [
    { name: 'Taslak', value: invoices.filter(i => i.status === 0).length },
    { name: 'Gönderildi', value: invoices.filter(i => i.status === 1).length },
    { name: 'Ödendi', value: invoices.filter(i => i.status === 2).length },
    { name: 'Vadesi Geçti', value: invoices.filter(i => i.status === 3).length },
    { name: 'İptal', value: invoices.filter(i => i.status === 4).length },
  ].filter(item => item.value > 0);

  // Warehouse revenue distribution for donut
  const warehouseRevenueDist = warehouseMetrics
    .filter(m => m.totalRevenue > 0)
    .map(m => ({ name: m.warehouse.name, value: m.totalRevenue }));

  // Warehouse order volume distribution
  const warehouseOrderDist = warehouseMetrics
    .filter(m => m.totalOrders > 0)
    .map(m => ({ name: m.warehouse.name, value: m.totalOrders }));

  const dataSource = warehouseMetrics.map((m, idx) => ({
    key: idx,
    orderNo: `WH-${m.warehouse.name}`,
    pharmacy: m.warehouse.name,
    total: `${new Intl.NumberFormat('tr-TR').format(m.totalRevenue)} ₺`,
    status: m.totalOrders > 0 ? 'Aktif' : 'Pasif',
    pending: m.pendingOrders,
    shipments: m.totalShipments,
    delivered: m.deliveredShipments,
    invoices: m.totalInvoices,
  }));

  const columns = [
    { title: 'Depo', dataIndex: 'pharmacy', key: 'pharmacy', width: 180, render: (_: any, record: { pharmacy: string }) => (
      <div>
        <Text strong>{record.pharmacy}</Text>
        <div style={{ fontSize: 11, color: '#64748B' }}>
          <InboxOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Depo
        </div>
      </div>
    )},
    { title: 'Bekleyen Sipariş', dataIndex: 'pending', key: 'pending', width: 120, render: (v: number) => <Badge count={v} color="#faad14" /> },
    { title: 'Sevkiyatlar', dataIndex: 'shipments', key: 'shipments', width: 100, render: (v: number) => <Badge count={v} color="#1D4ED8" /> },
    { title: 'Teslim Edilen', dataIndex: 'delivered', key: 'delivered', width: 100, render: (v: number) => <Badge count={v} color="#059669" /> },
    { title: 'Faturalar', dataIndex: 'invoices', key: 'invoices', width: 90 },
    { title: 'Toplam Ciro', dataIndex: 'total', key: 'total', width: 140, render: (v: string) => <Text strong style={{ color: '#059669' }}>{v}</Text> },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        return status === 'Aktif'
          ? <Badge status="success" text={<Text style={{ color: '#16a34a' }}>Aktif</Text>} />
          : <Badge status="default" text={<Text style={{ color: '#6b7280' }}>Pasif</Text>} />;
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
            <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>
              <InboxOutlined style={{ color: '#7C3AED', marginRight: 8 }} />
              B2B Depo Dashboard
            </h2>
            <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 13 }}>Tedarikçi → Depo sipariş, sevkiyat ve fatura takibi</p>
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
            style={{ background: '#7C3AED', borderColor: '#7C3AED' }}>
            Güncelle
          </Button>
        </div>
      </div>

      {/* KPI Kartları - Supplier B2B */}
      {loading && !trendData ? (
        <div className="flex justify-center py-12"><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Toplam Depo" value={supplierKPIs.totalWarehouses} subtitle="Aktif depo sayısı" color="#7C3AED" icon={<InboxOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Aktif Depo" value={supplierKPIs.activeWarehouses} subtitle="Sipariş veren depo" color="#1D4ED8" icon={<InboxOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Sevkiyatlar" value={supplierKPIs.totalShipments} subtitle={supplierKPIs.deliveredShipments > 0 ? `${supplierKPIs.deliveredShipments} teslim edildi` : 'Toplam'} color="#FF7A00" icon={<TruckOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Toplam Ciro" value={`${new Intl.NumberFormat('tr-TR').format(supplierKPIs.totalRevenue)} ₺`} subtitle={`${supplierKPIs.paidInvoices} fatura ödendi`} color="#059669" icon={<DollarOutlined />} />
            </Col>
          </Row>

          {/* Grafikler - Üst Satır */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined style={{ color: '#059669' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Fatura Durumu Dağılımı</span>
                  </div>
                }
              >
                <DonutChart
                  data={invoiceStatusDist.length > 0 ? invoiceStatusDist : [{ name: 'Veri yok', value: 1 }]}
                  colorMap={{ "Taslak": "#0ea5e9", "Gönderildi": "#7C3AED", "Ödendi": "#059669", "Vadesi Geçti": "#d97706", "İptal": "#94a3b8" }}
                  size={160}
                  title="FATURA"
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
                <FunnelChart data={shipmentStatusDist} />
              </Card>
            </Col>
          </Row>

          {/* Grafikler - Alt Satır */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                className="shadow-sm rounded-xl overflow-hidden"
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={
                  <div className="flex items-center gap-2">
                    <BarChartOutlined style={{ color: '#7C3AED' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Depo Bazlı Sipariş Hacmi</span>
                  </div>
                }
              >
                <DonutChart
                  data={warehouseOrderDist.length > 0 ? warehouseOrderDist : [{ name: 'Veri yok', value: 1 }]}
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
                    <DollarOutlined style={{ color: '#059669' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Depo Bazlı Ciro Dağılımı</span>
                  </div>
                }
              >
                <DonutChart
                  data={warehouseRevenueDist.length > 0 ? warehouseRevenueDist : [{ name: 'Veri yok', value: 1 }]}
                  size={160}
                  title="CİRO"
                />
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

          {/* Depo Tablosu */}
          <Card
            className="shadow-sm rounded-xl"
            styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
            title={
              <div className="flex items-center gap-2">
                <InboxOutlined style={{ color: '#7C3AED' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Depo Performans Tablosu</span>
              </div>
            }
          >
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey="key"
              size="middle"
              locale={{ emptyText: <Text type="secondary">Henüz depo verisi bulunmuyor.</Text> }}
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
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#92400e', fontWeight: 700 }}>Sevkiyat Takibi</Title>
                  <Text type="secondary">Depo sevkiyatlarını görüntüleyin</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/supplier/orders')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                  <InboxOutlined style={{ fontSize: 36, color: '#7C3AED', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#5b21b6', fontWeight: 700 }}>Sipariş Listesi</Title>
                  <Text type="secondary">Depo siparişlerini inceleyin</Text>
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
                  <FileTextOutlined style={{ fontSize: 36, color: '#059669', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#065f46', fontWeight: 700 }}>Fatura Yönetimi</Title>
                  <Text type="secondary">B2B faturaları görüntüleyin</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}