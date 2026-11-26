import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Select, DatePicker, Space, Popconfirm, InputNumber, Switch, Tag, Row, Col, Empty } from 'antd';
import { DollarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined, PercentageOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

//[cite: 23]
interface DrugPriceHistory {
  id: string;
  drugId: string;
  price: number;
  taxRate: number;
  validFrom: string;
  validTo: string | null;
  isCoveredByStateInsurance: boolean;
  stateCoveragePercentage: number;
}

interface Drug {
  id: string;
  name: string;
}

export default function DrugPriceHistoryList() {
  const [priceHistories, setPriceHistories] = useState<DrugPriceHistory[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // SGK karşılama durumuna göre yüzde alanını göster/gizle
  const [isCovered, setIsCovered] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pricingRes, drugRes] = await Promise.all([
        api.get('/api/app/drug-price-history'),
        api.get('/api/app/drug')
      ]);
      setPriceHistories(pricingRes.data.items || []);
      setDrugs(drugRes.data.items || []);
    } catch (error) {
      console.error('API Hatası:', error);
      message.error('Fiyatlandırma verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ 
      validFrom: dayjs(),
      isCoveredByStateInsurance: false,
      stateCoveragePercentage: 0,
      taxRate: 8 // Varsayılan KDV oranı (Örn: %8)[cite: 23]
    });
    setIsCovered(false);
    setIsModalVisible(true);
  };

  const showEditModal = (record: DrugPriceHistory) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      validFrom: record.validFrom ? dayjs(record.validFrom) : null,
      validTo: record.validTo ? dayjs(record.validTo) : null,
    });
    setIsCovered(record.isCoveredByStateInsurance);
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        validFrom: values.validFrom ? values.validFrom.toISOString() : null,
        validTo: values.validTo ? values.validTo.toISOString() : null,
      };

      if (editingId) {
        await api.put(`/api/app/drug-price-history/${editingId}`, payload);
        message.success('Fiyat kaydı güncellendi.');
      } else {
        await api.post('/api/app/drug-price-history', payload);
        message.success('Yeni fiyat kaydı oluşturuldu.');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Kayıt Hatası:', error);
      message.error('Fiyat kaydı kaydedilemedi.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/app/drug-price-history/${id}`);
      message.success('Fiyat kaydı silindi.');
      fetchData();
    } catch (error) {
      console.error('Silme Hatası:', error);
      message.error('Kayıt silinemedi.');
    }
  };

  const columns = [
    {
      title: 'İlaç Adı',
      key: 'drugName',
      render: (_: any, record: DrugPriceHistory) => {
        const drug = drugs.find(d => d.id === record.drugId);
        return <Text strong>{drug ? drug.name : 'Bilinmeyen İlaç'}</Text>;
      }
    },
    { 
      title: 'Fiyat', 
      dataIndex: 'price', 
      key: 'price',
      render: (price: number) => <Text strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)}</Text>
    },
    { 
      title: 'KDV Oranı', 
      dataIndex: 'taxRate', 
      key: 'taxRate',
      render: (rate: number) => <Text>%{rate}</Text>
    },
    { 
      title: 'Geçerlilik Başlangıcı', 
      dataIndex: 'validFrom', 
      key: 'validFrom',
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
    },
    { 
      title: 'Geçerlilik Bitişi', 
      dataIndex: 'validTo', 
      key: 'validTo',
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : <Tag color="green">Güncel</Tag>
    },
    {
      title: 'SGK Kapsamı',
      key: 'stateCoverage',
      render: (_: any, record: DrugPriceHistory) => {
        return record.isCoveredByStateInsurance 
          ? <Tag color="blue">SGK Karşılıyor (%{record.stateCoveragePercentage})</Tag> 
          : <Tag color="default">Karşılamıyor</Tag>;
      }
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: DrugPriceHistory) => (
        <Space>
          <Button ghost type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Popconfirm title="Bu fiyat kaydını silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><DollarOutlined style={{ color: '#ff7a00', marginRight: 12 }} />İlaç Fiyat Geçmişi</Title>}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10, boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Yeni Fiyat Ekle</Button>
          </Space>
        }
      >
        {/* Stats Row */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Toplam Fiyat Kaydı" value={priceHistories.length} subtitle="kayıt" color="#FF7A00" icon={<DollarOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Ortalama Fiyat" value={priceHistories.length > 0 ? Math.round(priceHistories.reduce((s, p) => s + p.price, 0) / priceHistories.length).toLocaleString('tr-TR') : 0} subtitle="₺" color="#1D4ED8" icon={<BarChartOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="SGK Kapsamında" value={priceHistories.filter(p => p.isCoveredByStateInsurance).length} subtitle="kayıt" color="#059669" icon={<PercentageOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Aktif Kayıt" value={priceHistories.filter(p => !p.validTo || dayjs(p.validTo).isAfter(dayjs(), 'day')).length} subtitle="kayıt" color="#FAAD14" icon={<CalendarOutlined />} />
          </Col>
        </Row>

        <Table
          dataSource={priceHistories}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered={false}
          size="middle"
          className="border border-slate-200 rounded-xl"
          locale={{ emptyText: <Empty description="Henüz price kaydı yok" /> }}
        />
      </Card>

      <Modal
        title={editingId ? "Fiyat Kaydını Düzenle" : "Yeni Fiyat Kaydı"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          
          <Form.Item name="drugId" label="İlaç Seçimi" rules={[{ required: true, message: 'İlaç seçimi zorunludur' }]}>
            <Select placeholder="İlaç ara ve seç" showSearch optionFilterProp="children">
              {drugs.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Space style={{ display: 'flex', width: '100%', gap: '16px' }}>
            <Form.Item name="price" label="Fiyat (KDV Hariç)" rules={[{ required: true }]} style={{ flex: 1 }}>
               {/* DbContext kısıtlaması: decimal(18,2) -> step 0.01 */}
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} addonAfter="₺" />
            </Form.Item>
            
            <Form.Item name="taxRate" label="KDV Oranı (%)" rules={[{ required: true }]} style={{ flex: 1 }}>
               {/* DbContext kısıtlaması: decimal(5,2) -> step 0.01 */}
              <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.01} addonAfter="%" />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex', width: '100%', gap: '16px' }}>
            {/* DbContext kısıtlaması: ValidFrom zorunlu DateTime */}
            <Form.Item name="validFrom" label="Geçerlilik Başlangıcı" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            {/* DbContext kısıtlaması: ValidTo Nullable DateTime? */}
            <Form.Item name="validTo" label="Geçerlilik Bitişi (Güncelse boş bırakın)" style={{ flex: 1 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
             <Space style={{ display: 'flex', width: '100%', gap: '16px', alignItems: 'center' }}>
                <Form.Item name="isCoveredByStateInsurance" label="SGK Karşılıyor mu?" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="Evet" unCheckedChildren="Hayır" onChange={(checked) => setIsCovered(checked)} />
                </Form.Item>
                
                {isCovered && (
                  <Form.Item name="stateCoveragePercentage" label="SGK Karşılama Oranı (%)" rules={[{ required: true }]} style={{ marginBottom: 0, flex: 1 }}>
                    {/* DbContext kısıtlaması: decimal(5,2) -> step 0.01 */}
                    <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.01} addonAfter="%" />
                  </Form.Item>
                )}
             </Space>
          </div>

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px', borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}