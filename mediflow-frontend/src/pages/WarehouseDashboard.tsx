import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Badge, Spin, Alert } from 'antd';
import { DatabaseOutlined, InboxOutlined, WarningOutlined, LineChartOutlined, BoxPlotOutlined, TruckOutlined, PlusCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface StockItem {
  key: string;
  batchNo: string;
  drug: string;
  stock: string;
  location: string;
}

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/app/dashboard/get-stats');
      const d = res.data?.data ?? res.data;
      setStats({
        totalItems: d.totalDrugs ?? 1420,
        criticalStock: d.criticalStockCount ?? 12,
        dailyOutbound: d.lowStockCount ?? 85,
        warehouseCapacity: 78,
        pendingOrders: d.pendingOrders ?? 0,
        totalSalesAmount: d.totalSalesAmount ?? 0,
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
    fetchData();
  }, []);

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
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

      {/* Başlık */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Depo Dashboard</h2>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 13 }}>Stok, sevkiyat ve raf yönetimi</p>
      </div>

      {/* KPI Kartları */}
      {loading && !stats ? (
        <div className="flex justify-center py-12"><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Toplam Stok Kalemi" value={stats?.totalItems ?? 1420} subtitle="Envanter kalemi" color="#6366f1" icon={<DatabaseOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Kritik Stok Seviyesi" value={stats?.criticalStock ?? 12} subtitle="Uyarı altı stok" color="#ef4444" icon={<WarningOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Günlük Çıkışlar" value={stats?.dailyOutbound ?? 85} subtitle="Adet / gün" color="#f97316" icon={<InboxOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KPICard title="Raf Doluluğu" value={`${stats?.warehouseCapacity ?? 78}%`} subtitle="Kapasite kullanımı" color="#10b981" icon={<BoxPlotOutlined />} />
            </Col>
          </Row>

          {/* Tablo */}
          <Card
            className="shadow-sm rounded-xl"
            styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
            title={
              <div className="flex items-center gap-2">
                <BoxPlotOutlined style={{ color: '#6366f1' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Ana Depo Stok Durumu</span>
              </div>
            }
          >
            <Table<StockItem>
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey="key"
              size="middle"
              locale={{ emptyText: <Text type="secondary">Stok kaydı bulunmuyor.</Text> }}
            />
          </Card>

          {/* Quick Actions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/warehouse/inventories')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                  <PlusCircleOutlined style={{ fontSize: 36, color: '#7c3aed', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#4c1d95', fontWeight: 700 }}>Stok Girişi</Title>
                  <Text type="secondary">Yeni ürün girişini kaydedin</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/admin/dashboard')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                  <WarningOutlined style={{ fontSize: 36, color: '#dc2626', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#991b1b', fontWeight: 700 }}>Uyarıları Görüntüle</Title>
                  <Text type="secondary">{stats?.criticalStock ?? 12} kritik stok uyarısı mevcut</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                className="shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate('/warehouse/shipments')}
              >
                <div style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                  <LineChartOutlined style={{ fontSize: 36, color: '#059669', marginBottom: 12 }} />
                  <Title level={5} style={{ margin: '8px 0 4px', color: '#065f46', fontWeight: 700 }}>Stok Hareketleri</Title>
                  <Text type="secondary">Gün içi çıkış/giriş hareketlerini görüntüleyin</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
