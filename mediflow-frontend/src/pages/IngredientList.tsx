import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, Row, Col, Avatar, Tooltip, Statistic, Divider, Empty, InputNumber } from 'antd';
import {
  ExperimentOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, SearchOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

interface Ingredient {
  id: string;
  name: string;
  description: string;
  type: number; // 0:Active, 1:Excipient, 2:Acid, 3:Base, 4:Salt
}

export default function IngredientList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/app/ingredient');
      setIngredients(response.data.items || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Etken madde verileri çekilirken bir hata oluştu.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: 0 });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Ingredient) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/ingredient/${editingId}`, values);
        message.success('Etken madde başarıyla güncellendi.');
      } else {
        await api.post('/api/app/ingredient', values);
        message.success('Yeni etken madde sisteme kaydedildi.');
      }
      setIsModalVisible(false);
      fetchIngredients();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Kayıt işlemi başarısız oldu.';
      message.error(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/ingredient/${id}`);
      message.success('Etken madde silindi.');
      fetchIngredients();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Silme işlemi başarısız (bu madde bir ilacın formülünde kullanılıyor olabilir).';
      message.error(errorMsg);
    }
  };

  const getTypeTag = (type: number) => {
    switch (type) {
      case 0: return <Tag color="blue" style={{ borderRadius: 6 }}>Ana Etken Madde (Active)</Tag>;
      case 1: return <Tag color="default" style={{ borderRadius: 6 }}>Yardımcı Madde (Excipient)</Tag>;
      case 2: return <Tag color="volcano" style={{ borderRadius: 6 }}>Asit (Acid)</Tag>;
      case 3: return <Tag color="cyan" style={{ borderRadius: 6 }}>Baz (Base)</Tag>;
      case 4: return <Tag color="purple" style={{ borderRadius: 6 }}>Tuz (Salt)</Tag>;
      default: return <Tag style={{ borderRadius: 6 }}>Bilinmiyor</Tag>;
    }
  };

  const typeLabels = ['Ana Etken Madde (Active)', 'Yardımcı Madde (Excipient)', 'Asit (Acid)', 'Baz (Base)', 'Tuz (Salt)'];

  const typeCounts = ingredients.reduce((acc, ing) => {
    acc[ing.type] = (acc[ing.type] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchText.toLowerCase()) ||
    ing.description.toLowerCase().includes(searchText.toLowerCase()) ||
    typeLabels[ing.type]?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Madde Adı',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={32} icon={<ExperimentOutlined />} style={{ background: '#fef3c7' }} />
          <Text strong style={{ fontSize: 14 }}>{text}</Text>
        </div>
      )
    },
    {
      title: 'Tipi',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (type: number) => getTypeTag(type)
    },
    {
      title: 'Açıklama / Kimyasal Bilgi',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text ? <Text style={{ fontSize: 13 }}>{text}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: Ingredient) => (
        <Space size={4}>
          <Tooltip title="Düzenle">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Maddeyi sistemden silmek istediğinize emin misiniz?"
              okText="Evet, Sil"
              cancelText="İptal"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} style={{ border: '1px solid #fecaca', borderRadius: 6 }} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <Card className="rounded-xl shadow-sm border-0 bg-white" bodyStyle={{ padding: 0 }}>
        <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                <ExperimentOutlined style={{ color: '#ff7a00', marginRight: 12 }} />
                Etken Madde Sözlüğü
              </Title>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Toplam {ingredients.length} madde kaydı
              </Text>
            </Col>
            <Col>
              <Space size={12}>
                <Input
                  placeholder="Madde adı, açıklama veya tip ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  allowClear
                  style={{ width: 280, borderRadius: 10 }}
                />
                <Tooltip title="Yenile">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchIngredients}
                    loading={loading}
                    style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showAddModal}
                  style={{
                    background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)',
                    borderColor: 'transparent',
                    borderRadius: 10,
                    boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)'
                  }}
                >
                  Yeni Madde Ekle
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ padding: '20px 24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Madde</span>}
                value={ingredients.length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ExperimentOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Ana Etken Madde</span>}
                value={typeCounts[0] || 0}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ExperimentOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Yardımcı Madde</span>}
                value={typeCounts[1] || 0}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ExperimentOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Diğer (Asit/Baz/Tuz)</span>}
                value={(typeCounts[2] || 0) + (typeCounts[3] || 0) + (typeCounts[4] || 0)}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ExperimentOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Table */}
        <div style={{ padding: '0 24px 24px' }}>
          <Table
            dataSource={filteredIngredients}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              className: 'mt-4'
            }}
            bordered={false}
            size="middle"
            style={{ borderRadius: 12, overflow: 'hidden' }}
            className="border border-slate-200 rounded-xl"
            rowClassName={(_, index) => index % 2 === 0 ? 'bg-slate-50' : ''}
            locale={{ emptyText: <Empty description="Henüz etken madde kaydı yok" /> }}
          />
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExperimentOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{editingId ? 'Etken Maddeyi Düzenle' : 'Yeni Etken Madde Kaydı'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        styles={{ body: { paddingTop: 24 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Madde Adı</span>}
            rules={[{ required: true, max: 128, message: 'Madde adı zorunludur (max 128 karakter)' }]}
          >
            <Input placeholder="Örn: Parasetamol" maxLength={128} showCount size="large" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="type" label={<span style={{ fontWeight: 600 }}>Bileşen Tipi</span>} rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}>
            <Select placeholder="Bileşen tipi seçin" size="large" style={{ borderRadius: 10 }}>
              <Select.Option value={0}>Ana Etken Madde (Active)</Select.Option>
              <Select.Option value={1}>Yardımcı Madde (Excipient)</Select.Option>
              <Select.Option value={2}>Asit Bileşeni (Acid)</Select.Option>
              <Select.Option value={3}>Baz Bileşeni (Base)</Select.Option>
              <Select.Option value={4}>Tuz Formu (Salt)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label={<span style={{ fontWeight: 600 }}>Açıklama / Kimyasal Bilgi</span>}>
            <Input.TextArea rows={3} placeholder="Madde hakkında detaylı bilgi..." size="large" style={{ borderRadius: 10 }} />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 12, borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}
            >
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}