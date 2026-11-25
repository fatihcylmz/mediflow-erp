import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Space, Popconfirm, Tag, Row, Col, Statistic, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

interface Supplier {
  id: string;
  name: string;
  taxNumber: string;
  contactName: string;
  contactSurname: string;
  phoneNumber: string;
  email: string;
}

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/app/supplier');
      setSuppliers(response.data.items || []);
    } catch (error) {
      console.error('API Hatası:', error);
      message.error('Tedarikçi verileri çekilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: Supplier) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/supplier/${editingId}`, values);
        message.success('Tedarikçi başarıyla güncellendi.');
      } else {
        await api.post('/api/app/supplier', values);
        message.success('Yeni tedarikçi başarıyla eklendi.');
      }
      setIsModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      message.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/supplier/${id}`);
      message.success('Tedarikçi silindi.');
      fetchSuppliers();
    } catch (error) {
      console.error('Silme hatası:', error);
      message.error('Silme işlemi başarısız oldu.');
    }
  };

  const columns = [
    { title: 'Firma Adı', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Vergi No', dataIndex: 'taxNumber', key: 'taxNumber', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Yetkili Kişi', key: 'contact', render: (_: any, record: Supplier) => `${record.contactName} ${record.contactSurname}` },
    { title: 'Telefon', dataIndex: 'phoneNumber', key: 'phoneNumber', render: (v: string) => v ? <span><PhoneOutlined style={{ marginRight: 6, color: '#ff7a00' }} />{v}</span> : '-' },
    { title: 'E-posta', dataIndex: 'email', key: 'email', render: (v: string) => v ? <span><MailOutlined style={{ marginRight: 6, color: '#3b82f6' }} />{v}</span> : '-' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Supplier) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showEditModal(record)} size="small" style={{ borderRadius: 8 }} />
          <Popconfirm title="Tedarikçiyi Sil?" description="Bu tedarikçiyi silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)} okText="Evet, Sil" cancelText="İptal">
            <Button danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 8 }} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <div className="space-y-4" style={{ padding: 0 }}>
      {/* Header Section */}
      <Card
        className="rounded-xl shadow-sm border-0 bg-white"
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <Row align="middle" gutter={16}>
            <Col>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShopOutlined style={{ fontSize: 22, color: 'white' }} />
              </div>
            </Col>
            <Col flex="auto">
              <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Tedarikçiler</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Tüm tedarikçi firmalarını yönetin ve takip edin</Text>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{
                background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent',
                borderRadius: 10, height: 42, fontWeight: 600, boxShadow: '0 4px 12px rgba(255,122,0,0.3)'
              }}>
                Yeni Tedarikçi Ekle
              </Button>
            </Col>
          </Row>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ padding: '16px 24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', color: 'white' }}>
              <Statistic title={<span style={{ opacity: 0.9, fontSize: 12 }}>Toplam Tedarikçi</span>} value={suppliers.length} valueStyle={{ color: '#fff', fontWeight: 700 }} />
            </Card>
          </Col>
        </Row>

        <div style={{ padding: '0 24px 24px' }}>
          <Table
            dataSource={suppliers}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="middle"
            style={{ borderRadius: 12, overflow: 'hidden' }}
            className="border border-slate-200 rounded-xl"
            rowClassName={(record, index) => index % 2 === 0 ? 'bg-slate-50' : ''}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Toplam ${t} kayıt` }}
          />
        </div>
      </Card>

      {/* Add/Edit Modal - Modern Design */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShopOutlined style={{ fontSize: 16, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700 }}>{editingId ? 'Tedarikçiyi Düzenle' : 'Yeni Tedarikçi Ekle'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Firma Adı" rules={[{ required: true, message: 'Firma adı zorunludur' }]}>
            <Input prefix={<ShopOutlined style={{ color: '#ff7a00' }} />} placeholder="Firma adını girin" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="taxNumber" label="Vergi Numarası" rules={[{ required: true, message: 'Vergi numarası zorunludur' }]}>
            <Input prefix={<IdcardOutlined style={{ color: '#3b82f6' }} />} placeholder="Vergi no girin" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactName" label="Yetkili Adı" rules={[{ required: true }]}>
                <Input placeholder="Ad" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactSurname" label="Yetkili Soyadı" rules={[{ required: true }]}>
                <Input placeholder="Soyad" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="phoneNumber" label="Telefon Numarası">
            <Input prefix={<PhoneOutlined style={{ color: '#10b981' }} />} placeholder="+90 5XX XXX XX XX" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="email" label="E-posta Adresi" rules={[{ type: 'email', message: 'Geçerli bir e-posta giriniz' }]}>
            <Input prefix={<MailOutlined style={{ color: '#8b5cf6' }} />} placeholder="ornek@firma.com" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Divider style={{ margin: '16px 0 20px' }} />

          <div style={{ textAlign: 'right', marginTop: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8, borderRadius: 8, height: 40 }}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit" style={{
              borderRadius: 8, height: 40, padding: '0 24px',
              background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', fontWeight: 600
            }}>
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
