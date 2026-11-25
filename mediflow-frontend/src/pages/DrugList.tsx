import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Popconfirm, Tag, Divider, Row, Col, Avatar, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined, MedicineBoxOutlined, SearchOutlined, FilterOutlined, BarChartOutlined, EyeOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

// --- INTERFACE TANIMLAMALARI ---
interface Ingredient { id: string; name: string; }

interface Drug {
  id: string;
  name: string;
  barcode: string;
  atcCode: string;
  form: number;
  dosage: number;
  dosageUnit: string;
  prescriptionType: number;
  requiresColdChain: boolean;
  shelfLifeInMonths: number;
  unitsPerBox: number;
  minimumStockLevel: number;
}

interface DrugIngredient {
  id: string;
  drugId: string;
  ingredientId: string;
  amount: number;
  unit: string;
}

export default function DrugList() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');

  const [isDrugModalVisible, setIsDrugModalVisible] = useState<boolean>(false);
  const [drugForm] = Form.useForm();
  const [editingDrugId, setEditingDrugId] = useState<string | null>(null);

  const [isFormulaModalVisible, setIsFormulaModalVisible] = useState<boolean>(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [drugIngredients, setDrugIngredients] = useState<DrugIngredient[]>([]);
  const [loadingFormula, setLoadingFormula] = useState<boolean>(false);
  const [formulaForm] = Form.useForm();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [drugRes, ingRes] = await Promise.all([
        api.get('/api/app/drug'),
        api.get('/api/app/ingredient')
      ]);
      setDrugs(drugRes.data.items || []);
      setIngredients(ingRes.data.items || []);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      message.error('Sistem verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const showAddDrugModal = () => {
    setEditingDrugId(null);
    drugForm.resetFields();
    drugForm.setFieldsValue({
      requiresColdChain: false,
      dosage: 0,
      unitsPerBox: 1,
      form: 0,
      prescriptionType: 0
    });
    setIsDrugModalVisible(true);
  };

  const showEditDrugModal = (record: Drug) => {
    setEditingDrugId(record.id);
    drugForm.setFieldsValue(record);
    setIsDrugModalVisible(true);
  };

  const handleDrugSave = async (values: any) => {
    try {
      if (editingDrugId) {
        await api.put(`/drug/${editingDrugId}`, values);
        message.success('İlaç başarıyla güncellendi.');
      } else {
        await api.post('/api/app/drug', values);
        message.success('Yeni ilaç sisteme eklendi.');
      }
      setIsDrugModalVisible(false);
      fetchInitialData();
    } catch (error) {
      message.error('İlaç kaydedilemedi.');
    }
  };

  const handleDrugDelete = async (id: string) => {
    try {
      await api.delete(`/drug/${id}`);
      message.success('İlaç silindi.');
      fetchInitialData();
    } catch (error) {
      message.error('Silme işlemi başarısız. Bu ilaca bağlı stok veya sipariş olabilir.');
    }
  };

  const showFormulaDetails = async (drug: Drug) => {
    setSelectedDrug(drug);
    setIsFormulaModalVisible(true);
    setLoadingFormula(true);
    formulaForm.resetFields();

    try {
      const response = await api.get('/api/app/drug-ingredient');
      const allItems = response.data.items || [];
      const filtered = allItems.filter((item: DrugIngredient) => item.drugId === drug.id);
      setDrugIngredients(filtered);
    } catch (error) {
      message.error('Formül yüklenemedi.');
    } finally {
      setLoadingFormula(false);
    }
  };

  const handleAddFormula = async (values: any) => {
    if (!selectedDrug) return;
    try {
      const payload = {
        drugId: selectedDrug.id,
        ingredientId: values.ingredientId,
        amount: values.amount,
        unit: values.unit
      };
      await api.post('/api/app/drug-ingredient', payload);
      message.success('Etken madde ilaca bağlandı.');
      showFormulaDetails(selectedDrug);
    } catch (error) {
      message.error('Etken madde eklenemedi.');
    }
  };

  const handleRemoveFormula = async (id: string) => {
    try {
      await api.delete(`/drug-ingredient/${id}`);
      message.success('Etken madde formülden çıkarıldı.');
      if (selectedDrug) showFormulaDetails(selectedDrug);
    } catch (error) {
      message.error('Çıkarma işlemi başarısız.');
    }
  };

  const getPrescriptionTypeTag = (type: number) => {
    switch (type) {
      case 0: return <Tag color="default" style={{ borderRadius: 6 }}>Reçetesiz</Tag>;
      case 1: return <Tag color="blue" style={{ borderRadius: 6 }}>Beyaz Reçete</Tag>;
      case 2: return <Tag color="green" style={{ borderRadius: 6 }}>Yeşil Reçete</Tag>;
      case 3: return <Tag color="red" style={{ borderRadius: 6 }}>Kırmızı Reçete</Tag>;
      case 4: return <Tag color="purple" style={{ borderRadius: 6 }}>Mor Reçete</Tag>;
      case 5: return <Tag color="orange" style={{ borderRadius: 6 }}>Turuncu Reçete</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  const getDrugFormText = (formType: number) => {
    switch (formType) {
      case 0: return 'Tablet';
      case 1: return 'Kapsül';
      case 2: return 'Şurup';
      case 3: return 'İğne/Ampul';
      case 4: return 'Merhem/Krem';
      case 5: return 'Damla';
      default: return 'Bilinmiyor';
    }
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(searchText.toLowerCase()) ||
    drug.barcode.includes(searchText) ||
    drug.atcCode.toLowerCase().includes(searchText.toLowerCase())
  );

  const drugColumns = [
    {
      title: 'İlaç Bilgisi',
      key: 'info',
      render: (_: any, record: Drug) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            icon={<MedicineBoxOutlined />}
            style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', fontSize: 18 }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 14 }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.atcCode || 'ATC kodu yok'}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Barkod',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
    },
    {
      title: 'Dozaj',
      key: 'dosage',
      width: 120,
      render: (_: any, record: Drug) => (
        <Badge
          color="#f0f9ff"
          text={<span style={{ background: '#e0f2fe', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>{record.dosage} {record.dosageUnit}</span>}
        />
      )
    },
    {
      title: 'Form',
      dataIndex: 'form',
      key: 'form',
      width: 100,
      render: (form: number) => <Text style={{ background: '#fafafa', padding: '4px 8px', borderRadius: 6 }}>{getDrugFormText(form)}</Text>
    },
    {
      title: 'Reçete Tipi',
      dataIndex: 'prescriptionType',
      key: 'prescriptionType',
      width: 130,
      render: (type: number) => getPrescriptionTypeTag(type)
    },
    {
      title: 'Soğuk Zincir',
      dataIndex: 'requiresColdChain',
      key: 'requiresColdChain',
      width: 100,
      render: (req: boolean) => req
        ? <Badge status="processing" text={<Text style={{ color: '#0ea5e9', fontWeight: 600 }}>Gerekli</Text>} />
        : <Badge status="success" text={<Text style={{ color: '#16a34a' }}>Hayır</Text>} />
    },
    {
      title: 'Hızlı İşlemler',
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: Drug) => (
        <Space direction="vertical" size={4}>
          <Tooltip title="Formül Detayları">
            <Button
              type="primary"
              size="small"
              icon={<ExperimentOutlined />}
              onClick={() => showFormulaDetails(record)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', border: 'none' }}
            >
              Formül
            </Button>
          </Tooltip>
          <Space size={4} style={{ width: '100%' }}>
            <Tooltip title="Düzenle">
              <Button
                icon={<EditOutlined />}
                onClick={() => showEditDrugModal(record)}
                style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </Tooltip>
            <Tooltip title="Sil">
              <Popconfirm title="Bu ilacı silmek istediğinize emin misiniz?" onConfirm={() => handleDrugDelete(record.id)}>
                <Button danger icon={<DeleteOutlined />} style={{ flex: 1, border: '1px solid #fecaca', borderRadius: 6 }} />
              </Popconfirm>
            </Tooltip>
          </Space>
        </Space>
      ),
    }
  ];

  const formulaColumns = [
    {
      title: 'Etken Madde',
      key: 'ingredient',
      width: 200,
      render: (_: any, record: DrugIngredient) => {
        const ing = ingredients.find(i => i.id === record.ingredientId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<ExperimentOutlined />} style={{ background: '#fef3c7' }} />
            <Text strong>{ing ? ing.name : 'Bilinmeyen Madde'}</Text>
          </div>
        );
      }
    },
    {
      title: 'Miktar',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right' as const,
      render: (val: number) => <Text strong>{val}</Text>
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (val: string) => <Tag style={{ borderRadius: 6 }}>{val}</Tag>
    },
    {
      title: '',
      key: 'action',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: DrugIngredient) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveFormula(record.id)}
          size="small"
        />
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Section - Modern Cards */}
      <Card
        className="rounded-xl shadow-sm border-0 bg-white"
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                <MedicineBoxOutlined style={{ color: '#ff7a00', marginRight: 12 }} />
                İlaç Envanteri
              </Title>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Toplam {drugs.length} ilaç kaydı
              </Text>
            </Col>
            <Col>
              <Space size={12}>
                <Input.Search
                  placeholder="İlaç ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  style={{ width: 280, borderRadius: 10 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchInitialData}
                  loading={loading}
                  style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showAddDrugModal}
                  style={{
                    background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)',
                    borderColor: 'transparent',
                    borderRadius: 10,
                    boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)'
                  }}
                >
                  Yeni İlaç Ekle
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ padding: '20px 24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', color: 'white' }}>
              <Row align="middle" gutter={12}>
                <Col>
                  <MedicineBoxOutlined style={{ fontSize: 28, opacity: 0.9 }} />
                </Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{drugs.length}</div>
                  <div style={{ opacity: 0.9, fontSize: 13 }}>Toplam İlaç</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
              <Row align="middle" gutter={12}>
                <Col><MedicineBoxOutlined style={{ fontSize: 28, opacity: 0.9, color: 'white' }} /></Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{ingredients.length}</div>
                  <div style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Etken Madde</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
              <Row align="middle" gutter={12}>
                <Col><MedicineBoxOutlined style={{ fontSize: 28, opacity: 0.9, color: 'white' }} /></Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>-</div>
                  <div style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Soğuk Zincir</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
              <Row align="middle" gutter={12}>
                <Col><BarChartOutlined style={{ fontSize: 28, opacity: 0.9, color: 'white' }} /></Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{filteredDrugs.length}</div>
                  <div style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Arama Sonucu</div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Main Table */}
        <div style={{ padding: '0 24px 24px' }}>
          <Table
            dataSource={filteredDrugs}
            columns={drugColumns}
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
            rowClassName={(record, index) => index % 2 === 0 ? 'bg-slate-50' : ''}
          />
        </div>
      </Card>

      {/* Add/Edit Drug Modal - Modern Design */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MedicineBoxOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{editingDrugId ? 'İlacı Düzenle' : 'Yeni İlaç Kaydı'}</span>
          </div>
        }
        open={isDrugModalVisible}
        onCancel={() => setIsDrugModalVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={drugForm} layout="vertical" onFinish={handleDrugSave}>
          <Row gutter={20}>
            <Col span={24}>
              <Form.Item
                name="name"
                label={<span style={{ fontWeight: 600 }}>İlaç Adı</span>}
                rules={[{ required: true, max: 128, message: 'İlaç adı zorunludur!' }]}
              >
                <Input
                  placeholder="Örn: Parol 500mg Tablet"
                  maxLength={128}
                  showCount
                  prefix={<MedicineBoxOutlined style={{ color: '#ff7a00' }} />}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="barcode" label={<span style={{ fontWeight: 600 }}>Barkod</span>} rules={[{ required: true, max: 50, message: 'Barkod zorunludur!' }]}>
                <Input placeholder="EAN-13 Barkod" maxLength={50} size="large" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="atcCode" label={<span style={{ fontWeight: 600 }}>ATC Kodu</span>} rules={[{ max: 20 }]}>
                <Input placeholder="Örn: N02BE01" maxLength={20} size="large" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '20px 0', background: '#e2e8f0' }} />

          <Row gutter={20}>
             <Col span={12}>
                <Form.Item name="form" label={<span style={{ fontWeight: 600 }}>İlaç Formu</span>} rules={[{ required: true, message: 'Form seçimi zorunludur!' }]}>
                  <Select
                    placeholder="Form Seçin"
                    size="large"
                    style={{ borderRadius: 10 }}
                    options={[
                      { value: 0, label: '💊 Tablet' },
                      { value: 1, label: '🧪 Kapsül' },
                      { value: 2, label: '🥄 Şurup' },
                      { value: 3, label: '💉 İğne/Ampul' },
                      { value: 4, label: '🧴 Merhem/Krem' },
                      { value: 5, label: '💧 Damla' },
                    ]}
                  />
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item name="prescriptionType" label={<span style={{ fontWeight: 600 }}>Reçete Tipi</span>} rules={[{ required: true, message: 'Reçete tipi seçimi zorunludur!' }]}>
                  <Select
                    placeholder="Reçete Tipi Seçin"
                    size="large"
                    style={{ borderRadius: 10 }}
                    options={[
                      { value: 0, label: 'Reçetesiz Satış' },
                      { value: 1, label: 'Beyaz Reçete (Normal)' },
                      { value: 2, label: 'Yeşil Reçete' },
                      { value: 3, label: 'Kırmızı Reçete' },
                      { value: 4, label: 'Mor Reçete' },
                      { value: 5, label: 'Turuncu Reçete' },
                    ]}
                  />
                </Form.Item>
             </Col>
          </Row>

          <Row gutter={20}>
            <Col span={6}>
              <Form.Item name="dosage" label={<span style={{ fontWeight: 600 }}>Dozaj</span>}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} step={0.01} min={0} size="large" addonAfter="mg" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dosageUnit" label={<span style={{ fontWeight: 600 }}>Birim</span>}>
                <Select placeholder="Birim Seç" size="large" style={{ borderRadius: 10 }} options={[
                  { value: 'mg', label: 'mg' },
                  { value: 'g', label: 'g' },
                  { value: 'mcg', label: 'mcg' },
                  { value: 'ml', label: 'ml' },
                  { value: 'IU', label: 'IU' },
                  { value: '%', label: '%' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unitsPerBox" label={<span style={{ fontWeight: 600 }}>Kutu İçi Adet</span>} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} min={1} size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="minimumStockLevel" label={<span style={{ fontWeight: 600 }}>Min. Stok</span>}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} size="large" addonAfter="adet" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="shelfLifeInMonths" label={<span style={{ fontWeight: 600 }}>Raf Ömrü (Ay)</span>}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} min={1} size="large" addonAfter="ay" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requiresColdChain"
                label={<span style={{ fontWeight: 600 }}>Soğuk Zincir Gerektirir mi?</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet, gereklidir" unCheckedChildren="Hayır, gerekmez" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsDrugModalVisible(false)} style={{ marginRight: 12, borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Formula Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #10b981, #34d399)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExperimentOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              {selectedDrug?.name} - Etken Madde Formülü
            </span>
          </div>
        }
        open={isFormulaModalVisible}
        onCancel={() => setIsFormulaModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsFormulaModalVisible(false)} style={{ borderRadius: 10 }}>Kapat</Button>]}
        width={800}
      >
        <Card size="small" style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Form form={formulaForm} layout="inline" onFinish={handleAddFormula} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Form.Item name="ingredientId" rules={[{ required: true, message: 'Seçiniz' }]}>
              <Select placeholder="Etken Madde Seç" style={{ width: 220 }} showSearch optionFilterProp="children" size="large" options={ingredients.map(i => ({ value: i.id, label: i.name }))} />
            </Form.Item>
            <Form.Item name="amount" rules={[{ required: true, message: 'Miktar' }]}>
              <InputNumber placeholder="Miktar" min={0} step={0.01} style={{ width: 120 }} size="large" addonAfter="mg" />
            </Form.Item>
            <Form.Item name="unit" rules={[{ required: true, message: 'Birim' }]}>
              <Select placeholder="Birim" style={{ width: 100 }} size="large" options={[
                { value: 'mg', label: 'mg' },
                { value: 'g', label: 'g' },
                { value: 'mcg', label: 'mcg' },
                { value: 'ml', label: 'ml' },
                { value: 'IU', label: 'IU' },
              ]} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, border: 'none' }}>Ekle</Button>
            </Form.Item>
          </Form>
        </Card>

        <Table
          dataSource={drugIngredients}
          columns={formulaColumns}
          rowKey="id"
          pagination={false}
          size="small"
          loading={loadingFormula}
          bordered={false}
          className="rounded-lg overflow-hidden"
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Modal>
    </div>
  );
}