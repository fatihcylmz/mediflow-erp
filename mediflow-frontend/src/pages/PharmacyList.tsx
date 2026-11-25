import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Space, Popconfirm, Tag, Row, Col, Empty, Tooltip } from 'antd';
import { ShopOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined, ReloadOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface Pharmacy {
  id: string;
  name: string;
  gln: string; 
  taxNumber: string;
  pharmacistName: string;
  pharmacistLicenseNumber: string;
  address: string;
  phoneNumber: string;
}

interface PharmacyStock {
  id: string;
  pharmacyId: string;
  drugId: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
}

interface Drug {
  id: string;
  name: string;
}

export default function PharmacyList() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Eczane CRUD Modal State'leri
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Eczane Stokları Modal State'leri
  const [isStockModalVisible, setIsStockModalVisible] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacyStocks, setPharmacyStocks] = useState<PharmacyStock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState<boolean>(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pharmRes, drugRes] = await Promise.all([
        api.get('/api/app/pharmacy'),
        api.get('/api/app/drug') 
      ]);
      setPharmacies(pharmRes.data.items || []);
      setDrugs(drugRes.data.items || []);
    } catch (error) {
      message.error('Veriler çekilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: Pharmacy) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/pharmacy/${editingId}`, values);
        message.success('Eczane bilgileri güncellendi.');
      } else {
        await api.post('/api/app/pharmacy', values);
        message.success('Yeni eczane sisteme kaydedildi.');
      }
      setIsModalVisible(false);
      fetchInitialData();
    } catch (error) {
      message.error('Kayıt işlemi başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/pharmacy/${id}`);
      message.success('Eczane silindi.');
      fetchInitialData();
    } catch (error) {
      message.error('Silme başarısız (Eczanenin stokları veya siparişleri olabilir).');
    }
  };

  // --- STOKLARI GETİR (HATA AYIKLAMA İLE) ---
  const showPharmacyStocks = async (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsStockModalVisible(true);
    setLoadingStocks(true);

    try {
      const response = await api.get('/api/app/pharmacy-stock');
      
      // KONSOL KONTROLLERİ: Sorunun nerede olduğunu tam buradan anlayacağız.
      console.log("BACKEND'DEN GELEN TÜM STOKLAR:", response.data);

      const allStocks = response.data.items || [];
      const filtered = allStocks.filter((stock: PharmacyStock) => stock.pharmacyId === pharmacy.id);
      
      console.log(`FİLTRELENMİŞ STOKLAR (${pharmacy.name}):`, filtered);

      setPharmacyStocks(filtered);
    } catch (error) {
      console.error("STOK ÇEKME HATASI:", error);
      message.error('Eczane stokları yüklenemedi. API bağlantısını kontrol edin.');
    } finally {
      setLoadingStocks(false);
    }
  };

  const columns = [
    { title: 'Eczane Adı', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'İTS / GLN Numarası', dataIndex: 'gln', key: 'gln', render: (gln: string) => <Tag color="blue">{gln}</Tag> },
    { title: 'Sorumlu Eczacı', dataIndex: 'pharmacistName', key: 'pharmacistName' },
    { title: 'Telefon', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Pharmacy) => (
        <Space>
          <Button type="primary" icon={<InboxOutlined />} onClick={() => showPharmacyStocks(record)}>
            Rafları Gör
          </Button>
          <Button ghost type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Popconfirm title="Eczaneyi silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const stockColumns = [
    {
      title: 'İlaç Adı',
      key: 'drugName',
      render: (_: any, record: PharmacyStock) => {
        const drug = drugs.find(d => d.id === record.drugId);
        return <Text strong>{drug ? drug.name : 'Bilinmeyen İlaç'}</Text>;
      }
    },
    { title: 'Lot Numarası', dataIndex: 'lotNumber', key: 'lotNumber', render: (lot: string) => <Tag>{lot}</Tag> },
    { 
      title: 'SKT', 
      dataIndex: 'expirationDate', 
      key: 'expirationDate',
      render: (date: string) => {
        const isExpired = new Date(date) < new Date();
        return <Text type={isExpired ? "danger" : undefined}>{new Date(date).toLocaleDateString('tr-TR')}</Text>;
      }
    },
    { 
      title: 'Miktar', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      render: (qty: number) => <Text strong type="success">{qty} Kutu</Text> 
    }
  ];

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><ShopOutlined style={{ color: '#ff7a00', marginRight: 12 }} />Eczane Yönetimi</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10 }}>Yeni Eczane Ekle</Button>}
      >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 22 }}>
            <ShopOutlined style={{ color: '#FF7A00', marginRight: 10, verticalAlign: 'middle' }} />
            Eczane Yönetimi
          </h2>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Tüm eczane kayıtlarını görüntüleyin ve yönetin.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large"
          style={{ background: '#FF7A00', borderColor: '#FF7A00', borderRadius: 10 }}>
          Yeni Eczane Ekle
        </Button>
      </div>

      {/* KPI Cards - Modern White Surface */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Toplam Eczane" value={pharmacies.length} subtitle="kayıt" color="#FF7A00" icon={<ShopOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Aktif Eczane" value={pharmacies.filter(p => p.pharmacistName).length} subtitle="eczacı atanmış" color="#059669" icon={<CheckCircleOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="GLN Kaydı Olan" value={pharmacies.filter(p => p.gln).length} subtitle="ITS numarası tanımlı" color="#1D4ED8" icon={<InboxOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Tam Verili" value={pharmacies.filter(p => p.pharmacistLicenseNumber && p.address).length} subtitle="eksiksiz kayıt" color="#64748B" icon={<InboxOutlined />} />
        </Col>
      </Row>

        <Table dataSource={pharmacies} columns={columns} rowKey="id" loading={loading} bordered={false} size="middle" className="border border-slate-200 rounded-xl" />
      </Card>

      <Modal title={editingId ? "Eczane Bilgilerini Düzenle" : "Yeni Eczane Kaydı"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Eczane Adı" rules={[{ required: true, max: 128 }]}><Input maxLength={128} showCount /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gln" label="İTS / GLN Numarası" rules={[{ required: true, len: 13 }]}><Input maxLength={13} showCount /></Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pharmacistName" label="Sorumlu Eczacı Adı" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pharmacistLicenseNumber" label="Ruhsat Numarası" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="taxNumber" label="Vergi Numarası"><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Telefon Numarası"><Input /></Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Açık Adres">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px', borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={selectedPharmacy ? `${selectedPharmacy.name} - Raf Stokları` : 'Eczane Stokları'} open={isStockModalVisible} onCancel={() => setIsStockModalVisible(false)} footer={[<Button key="close" onClick={() => setIsStockModalVisible(false)}>Kapat</Button>]} width={800}>
        <Table dataSource={pharmacyStocks} columns={stockColumns} rowKey="id" loading={loadingStocks} size="small" bordered />
      </Modal>
    </div>
  );
}