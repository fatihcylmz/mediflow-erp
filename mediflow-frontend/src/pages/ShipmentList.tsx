import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, Popconfirm, Row, Col, Statistic, Empty } from 'antd';
import { TruckOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface Shipment {
  id: string;
  orderId?: string;
  pharmacyId: string;
  trackingNumber: string;
  shipmentDate: string;
  status: number; 
  deliveryDate: string | null;
}

 export interface ShipmentItem {
  id: string;
  shipmentId: string;
  stockBatchId: string;
  quantity: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  drugId: string;
  stockBatchId?: string; // Backend'den gelen lot ID'si
  requestedQuantity: number;
  approvedQuantity: number;
}

interface Pharmacy { id: string; name: string; }
interface Order { id: string; orderNumber: string; pharmacyId: string; status: number; }
interface Drug { id: string; name: string; }

export default function ShipmentList() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State'leri (CREATE/UPDATE için)
  const [isFormModalVisible, setIsFormModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detay Modal State'leri (READ Items için)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [shipmentItems, setShipmentItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipRes, pharmRes, orderRes, drugRes, itemRes] = await Promise.all([
        api.get('/api/app/shipment'),
        api.get('/api/app/pharmacy'),
        api.get('/api/app/order'),
        api.get('/api/app/drug'),
        api.get('/api/app/order-item')
      ]);
      setShipments(shipRes.data.items || []);
      setPharmacies(pharmRes.data.items || []);
      setOrders(orderRes.data.items || []);
      setDrugs(drugRes.data.items || []);
      setOrderItems(itemRes.data.items || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Sevkiyat verileri yüklenemedi.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD İŞLEMLERİ ---

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    
    // Otomatik Takip Numarası Üretme
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const autoTrackingNo = `TRK-${dayjs().format('YYYYMMDD')}-${randomCode}`;

    form.setFieldsValue({
      status: 0,
      shipmentDate: dayjs(),
      trackingNumber: autoTrackingNo
    });
    setIsFormModalVisible(true);
  };

  const showEditModal = (record: Shipment) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      shipmentDate: record.shipmentDate ? dayjs(record.shipmentDate) : null,
      deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
      orderId: record.orderId // Sipariş bağını modalda tut
    });
    setIsFormModalVisible(true);
  };

  const handleOrderSelect = (orderId: string) => {
    const selected = orders.find(o => o.id === orderId);
    if (selected) {
      form.setFieldsValue({ pharmacyId: selected.pharmacyId, orderId: selected.id });
    }
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        orderId: values.orderId || null,
        pharmacyId: values.pharmacyId,
        trackingNumber: values.trackingNumber,
        status: values.status,
        shipmentDate: values.shipmentDate ? values.shipmentDate.toISOString() : null,
        deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString() : null,
      };

      if (editingId) {
        await api.put(`/shipment/${editingId}`, payload);
        message.success('Sevkiyat güncellendi.');
      } else {
        // 1. Ana Sevkiyat Kaydını Oluştur
        const response = await api.post('/api/app/shipment', payload);
        const newShipmentId = response.data.id;

        // 2. KRİTİK NOKTA: Sipariş kalemlerini bul ve SEVKİYAT KALEMİ olarak veritabanına yaz!
        if (payload.orderId) {
          const relatedOrderItems = orderItems.filter(item => item.orderId === payload.orderId);
          
          for (const item of relatedOrderItems) {
            // Eğer backend siparişte lot ayırmışsa direkt onu kullanıyoruz
            if(item.stockBatchId) {
                await api.post('/api/app/shipment-item', {
                    shipmentId: newShipmentId,
                    stockBatchId: item.stockBatchId,
                    quantity: item.approvedQuantity || item.requestedQuantity
                });
            } else {
                console.warn(`Uyarı: İlaç (ID: ${item.drugId}) için lot (stockBatchId) bilgisi bulunamadı. Backend bu veriyi sağlamalı.`);
            }
          }
        }
        message.success('Yeni sevkiyat oluşturuldu ve kalemleri eklendi.');
      }
      setIsFormModalVisible(false);
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'İşlem başarısız oldu.';
      message.error(errorMsg);
    }
  };

  const handleStatusChange = async (record: Shipment, newStatus: number) => {
    try {
      const payload = {
        ...record,
        status: newStatus,
        deliveryDate: newStatus === 2 ? new Date().toISOString() : record.deliveryDate
      };
      await api.put(`/shipment/${record.id}`, payload);
      message.success(`Sevkiyat durumu güncellendi: ${getStatusText(newStatus)}`);
      
      // Stoktan düştüğünü görmek için verileri yenile
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Durum güncellenemedi. Stok hatası olabilir.';
      message.error(errorMsg);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Hazırlanıyor';
      case 1: return 'Yola Çıktı';
      case 2: return 'Eczane Teslim Aldı';
      case 3: return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/shipment/${id}`);
      message.success('Sevkiyat silindi.');
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Silme işlemi başarısız.';
      message.error(errorMsg);
    }
  };

  const showShipmentDetails = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalVisible(true);
    setLoadingItems(true);

    try {
      let itemsToDisplay: any[] = [];
      if (shipment.orderId) {
        itemsToDisplay = orderItems.filter(item => item.orderId === shipment.orderId);
      }
      setShipmentItems(itemsToDisplay);
    } catch (error: any) {
      message.error('Sevkiyat kalemleri yüklenemedi.');
    } finally {
      setLoadingItems(false);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Tag icon={<SyncOutlined spin />} color="processing">Hazırlanıyor</Tag>;
      case 1: return <Tag color="orange">Yola Çıktı</Tag>;
      case 2: return <Tag icon={<CheckCircleOutlined />} color="success">Eczane Teslim Aldı</Tag>;
      case 3: return <Tag icon={<CloseCircleOutlined />} color="error">İptal Edildi</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  const columns = [
    { title: 'Takip No', dataIndex: 'trackingNumber', key: 'trackingNumber', width: 140, render: (text: string) => <Text strong>{text}</Text> },
    { 
      title: 'İlgili Sipariş', 
      key: 'order',
      width: 120,
      render: (_: any, record: Shipment) => {
        const ord = orders.find(o => o.id === record.orderId);
        return ord ? <Tag color="blue">{ord.orderNumber}</Tag> : <Text type="danger" strong>Bağlantı Yok</Text>;
      }
    },
    {
      title: 'Hedef Eczane',
      key: 'pharmacy',
      width: 160,
      render: (_: any, record: Shipment) => {
        const pharm = pharmacies.find(p => p.id === record.pharmacyId);
        return pharm ? pharm.name : 'Bilinmiyor';
      }
    },
    { 
      title: 'Sevkiyat Tarihi', 
      dataIndex: 'shipmentDate', 
      key: 'shipmentDate',
      width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
    },
    { 
      title: 'Durum', 
      dataIndex: 'status', 
      key: 'status',
      width: 130,
      render: (status: number) => getStatusTag(status)
    },
    {
      title: 'İşlemler & Workflow',
      key: 'actions',
      render: (_: any, record: Shipment) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<TruckOutlined />} onClick={() => showShipmentDetails(record)}>İçerik</Button>

          {record.status === 0 && (
            <Button size="small" type="default" style={{ color: '#fa8c16', borderColor: '#fa8c16' }} icon={<SendOutlined />} onClick={() => handleStatusChange(record, 1)}>Yola Çıkar</Button>
          )}

          {record.status === 1 && (
            <Button size="small" type="default" style={{ color: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(record, 2)}>Teslim Onayla</Button>
          )}

          {record.status !== 2 && record.status !== 3 && (
            <Button size="small" danger type="text" onClick={() => handleStatusChange(record, 3)}>İptal</Button>
          )}

          <Button ghost size="small" type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          
          <Popconfirm title="Sevkiyatı silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const itemColumns = [
    { 
      title: 'İlaç Adı', 
      key: 'drugName',
      render: (_: any, record: any) => {
        const drugId = record.drugId;
        const drug = drugs.find(d => d.id === drugId);
        return <Text strong>{drug ? drug.name : 'Bilinmeyen İlaç'}</Text>;
      }
    },
    { 
      title: 'Gönderilen / Onaylanan Miktar', 
      key: 'quantity',
      render: (_: any, record: any) => <Text strong>{record.approvedQuantity || record.quantity || 0} Kutu</Text> 
    }
  ];

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><TruckOutlined style={{ color: '#ff7a00', marginRight: 12 }} />Sevkiyat Yönetimi</Title>}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10, boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Yeni Sevkiyat</Button>
          </Space>
        }
      >
      {/* KPI Cards - Modern White Surface */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Toplam Sevkiyat" value={shipments.length} subtitle="kargo kaydı" color="#FF7A00" icon={<TruckOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Hazırlanıyor" value={shipments.filter(s => s.status === 0).length} subtitle="paketleniyor" color="#FAAD14" icon={<SyncOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Yola Çıkan" value={shipments.filter(s => s.status === 1).length} subtitle="şu an yolda" color="#1D4ED8" icon={<SendOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Teslim Edilen" value={shipments.filter(s => s.status === 2).length} subtitle="teslim tamamlandı" color="#059669" icon={<CheckCircleOutlined />} />
        </Col>
      </Row>

        <Table dataSource={shipments} columns={columns} rowKey="id" loading={loading} bordered={false} scroll={{ x: 900 }} size="middle" className="border border-slate-200 rounded-xl" locale={{ emptyText: <Empty description="Henüz sevkiyat kaydı yok" /> }} />
      </Card>

      {/* FORM MODALI (Create/Update) */}
      <Modal
        title={editingId ? "Sevkiyatı Güncelle" : "Yeni Sevkiyat Oluştur"}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="pharmacyId" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="orderId" label="İlgili Onaylı Sipariş" rules={[{ required: true, message: 'Sipariş seçimi zorunludur' }]}>
            <Select placeholder="Sipariş Seçin" onChange={handleOrderSelect} allowClear showSearch optionFilterProp="children">
              {/* Sadece onaylı siparişleri gösterir */}
              {orders.filter(o => o.status === 1).map(o => <Select.Option key={o.id} value={o.id}>{o.orderNumber}</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item name="trackingNumber" label="Takip Numarası / İrsaliye No" rules={[{ required: true, max: 100, message: 'Takip numarası zorunludur' }]}>
            <Input placeholder="Otomatik oluşturulur" maxLength={100} showCount />
          </Form.Item>

          <Space style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="shipmentDate" label="Sevkiyat Tarihi" rules={[{ required: true, message: 'Tarih seçimi zorunlu' }]} style={{ flex: 1 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="deliveryDate" label="Eczane Teslim Tarihi (İTS)" style={{ flex: 1 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item name="status" label="Sevkiyat Durumu">
            <Select disabled>
              <Select.Option value={0}>Hazırlanıyor (0)</Select.Option>
              <Select.Option value={1}>Yola Çıktı (1)</Select.Option>
              <Select.Option value={2}>Eczane Teslim Aldı (2)</Select.Option>
              <Select.Option value={3}>İptal Edildi (3)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
            <Button onClick={() => setIsFormModalVisible(false)} style={{ marginRight: '8px' }}>İptal</Button>
            <Button type="primary" htmlType="submit">Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* DETAY MODALI (Items) */}
      <Modal
        title={selectedShipment ? `İrsaliye Kalemleri - ${selectedShipment.trackingNumber}` : 'Sevkiyat İçeriği'}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={700}
        footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>Kapat</Button>]}
      >
        {loadingItems ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor...</div>
        ) : (
          <Table dataSource={shipmentItems} columns={itemColumns} rowKey="id" pagination={false} size="small" bordered />
        )}
      </Modal>
    </div>
  );
}