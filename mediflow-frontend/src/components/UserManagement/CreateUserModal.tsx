import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Row, Col, Card, Typography, Divider } from 'antd';
import {
  UserAddOutlined, ShopOutlined, DatabaseOutlined, TruckOutlined,
  PhoneOutlined, UserOutlined, MailOutlined, SafetyCertificateOutlined, LockOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface CreateUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  createUserAsync: (input: any) => Promise<any>;
}

interface RoleOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'Admin',
    label: 'Admin',
    icon: <SafetyCertificateOutlined />,
    description: 'Tüm sisteme tam erişim, tüm modüller ve kullanıcı yönetimi.'
  },
  {
    value: 'PharmacyAdmin',
    label: 'Eczacı Yetkilisi',
    icon: <ShopOutlined />,
    description: 'Eczanesine ait siparişler, stoklar, reçeteler ve satış işlemlerini yönetir.'
  },
  {
    value: 'WarehouseAdmin',
    label: 'Depocu',
    icon: <DatabaseOutlined />,
    description: 'Depo stokları, envanter hareketleri ve sevkiyatları yönetir.'
  },
  {
    value: 'Supplier',
    label: 'Tedarikçi',
    icon: <TruckOutlined />,
    description: 'Gelen siparişleri, sevkiyatları ve faturalarını yönetir.'
  }
];

export default function CreateUserModal({ visible, onCancel, onSuccess, createUserAsync }: CreateUserModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedRole('');
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    const input: any = {
      UserName: (values.userName || '').trim(),
      Email: (values.email || '').trim(),
      Password: values.password,
      Name: (values.name || '').trim(),
      Surname: (values.surname || '').trim(),
      PhoneNumber: (values.phoneNumber || '').trim(),
      Address: (values.address || '').trim(),
      RoleName: selectedRole
    };

    if (selectedRole === 'PharmacyAdmin') {
      input.PharmacyName = values.pharmacyName;
      input.PharmacyGln = values.pharmacyGLN;
    } else if (selectedRole === 'WarehouseAdmin') {
      input.WarehouseName = values.warehouseName;
      input.WarehouseLocation = values.warehouseLocation;
    } else if (selectedRole === 'Supplier') {
      input.SupplierName = values.supplierName;
      input.SupplierTaxNumber = values.supplierTaxNumber;
    }

    try {
      await createUserAsync(input);
      message.success('Kullanıcı başarıyla oluşturuldu');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      const detail = error?.response?.data?.error?.message;
      message.error(detail || 'Kullanıcı oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleMeta = roleOptions.find(r => r.value === selectedRole);

  return (
    <Modal
      title={<span style={{ color: '#ff7a00', fontWeight: 700 }}><UserAddOutlined /> Yeni Kullanıcı Ekle</span>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={760}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Card size="small" title="1. Bu kişi kim?" style={{ marginBottom: 16, borderColor: '#ffe0c2' }}>
          <Form.Item
            name="role"
            label="Kullanıcı Rolü"
            rules={[{ required: true, message: 'Lütfen bir rol seçin' }]}
            style={{ marginBottom: 8 }}
          >
            <Select
              placeholder="Rol seçin"
              onChange={(value) => setSelectedRole(value)}
              options={roleOptions.map(role => ({
                value: role.value,
                label: (
                  <span>
                    <span style={{ color: '#ff7a00', marginRight: 8 }}>{role.icon}</span>
                    {role.label}
                  </span>
                )
              }))}
            />
          </Form.Item>

          {selectedRoleMeta && (
            <div style={{ padding: 10, backgroundColor: '#fff7f0', borderRadius: 6, border: '1px solid #ffe0c2' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{selectedRoleMeta.description}</Text>
            </div>
          )}
        </Card>

        <Card size="small" title="2. Yetkili / iletişim bilgileri" style={{ marginBottom: 16, borderColor: '#ffe0c2' }}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Lütfen adı girin' }]}>
                <Input placeholder="Örn: Ahmet" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="surname" label="Soyad" rules={[{ required: true, message: 'Lütfen soyadı girin' }]}>
                <Input placeholder="Örn: Yılmaz" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phoneNumber"
                label="Telefon"
                rules={[{ required: true, message: 'Lütfen telefon numarasını girin' }]}
              >
                <Input placeholder="+90 555 123 45 67" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: 'Lütfen e-posta adresini girin' },
                  { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                ]}
              >
                <Input placeholder="ornek@email.com" prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Adres" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Adres bilgisi" />
          </Form.Item>
        </Card>

        {selectedRole !== 'Admin' && (
          <Card
            size="small"
            title={
              selectedRole === 'PharmacyAdmin'
                ? '3. Eczane bilgileri'
                : selectedRole === 'WarehouseAdmin'
                  ? '3. Depo bilgileri'
                  : '3. Tedarikçi bilgileri'
            }
            style={{ marginBottom: 16, borderColor: '#ffe0c2', background: '#fff9f5' }}
          >
            <Row gutter={12}>
              {selectedRole === 'PharmacyAdmin' && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item name="pharmacyName" label="Eczane Adı" rules={[{ required: true, message: 'Lütfen eczane adını girin' }]}>
                      <Input placeholder="Örn: Merkez Eczanesi" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="pharmacyGLN" label="GLN Numarası" rules={[{ required: true, message: 'Lütfen GLN numarasını girin' }]}>
                      <Input placeholder="13 haneli GLN" />
                    </Form.Item>
                  </Col>
                </>
              )}

              {selectedRole === 'WarehouseAdmin' && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item name="warehouseName" label="Depo Adı" rules={[{ required: true, message: 'Lütfen depo adını girin' }]}>
                      <Input placeholder="Örn: Ankara Merkez Depo" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="warehouseLocation" label="Depo Konumu" rules={[{ required: true, message: 'Lütfen konum girin' }]}>
                      <Input placeholder="Örn: İstanbul - Merkez" />
                    </Form.Item>
                  </Col>
                </>
              )}

              {selectedRole === 'Supplier' && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item name="supplierName" label="Tedarikçi Firma Adı" rules={[{ required: true, message: 'Lütfen firma adını girin' }]}>
                      <Input placeholder="Örn: PharmaSupply A.Ş." />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="supplierTaxNumber" label="Vergi Numarası" rules={[{ required: true, message: 'Lütfen vergi numarasını girin' }]}>
                      <Input placeholder="Vergi numarası" />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        )}

        <Card size="small" title="4. Sisteme giriş bilgileri" style={{ marginBottom: 8, borderColor: '#ffe0c2' }}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                name="userName"
                label="Kullanıcı Adı"
                rules={[{ required: true, message: 'Lütfen kullanıcı adını girin' }]}
                extra="Bu kişi sisteme bu kullanıcı adıyla giriş yapacak."
              >
                <Input placeholder="Örn: ahmet.yilmaz" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Şifre"
                rules={[
                  { required: true, message: 'Lütfen şifre girin' },
                  { min: 6, message: 'Şifre en az 6 karakter olmalı' }
                ]}
              >
                <Input.Password placeholder="******" prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="confirmPassword"
            label="Şifreyi Onayla"
            dependencies={['password']}
            style={{ marginBottom: 0 }}
            rules={[
              { required: true, message: 'Lütfen şifreyi tekrar girin' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor'));
                }
              })
            ]}
          >
            <Input.Password placeholder="******" prefix={<LockOutlined />} />
          </Form.Item>
        </Card>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onCancel}>İptal</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ minWidth: 160, background: '#ff7a00', borderColor: '#ff7a00' }}
          >
            Kullanıcı Oluştur
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
