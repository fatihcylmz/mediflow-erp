import React, { useCallback, useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Select, message, Popconfirm, Input, Row, Col, Spin, Alert, Modal, Form, Divider } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { UserAddOutlined, TeamOutlined, ReloadOutlined, DeleteOutlined, SearchOutlined, ShopOutlined, DatabaseOutlined, TruckOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import CreateUserModal from './CreateUserModal';
import api from '../../services/api';

const { Title, Text } = Typography;

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  address?: string;
  roleName: string;
  roleDisplayName?: string;
  isActive?: boolean;
}

const ROLE_FILTERS = [
  { value: '', label: 'Tüm Kullanıcılar' },
  { value: 'Admin', label: 'Admin' },
  { value: 'PharmacyAdmin', label: 'Eczacı' },
  { value: 'WarehouseAdmin', label: 'Depocu' },
  { value: 'Supplier', label: 'Tedarikçi' },
  { value: 'Sales', label: 'Satış' },
];

const ROLE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Admin: { label: 'Admin', color: 'volcano', icon: <SafetyCertificateOutlined /> },
  PharmacyAdmin: { label: 'Eczacı', color: 'green', icon: <ShopOutlined /> },
  WarehouseAdmin: { label: 'Depocu', color: 'blue', icon: <DatabaseOutlined /> },
  Supplier: { label: 'Tedarikçi', color: 'orange', icon: <TruckOutlined /> },
  Sales: { label: 'Satış', color: 'purple', icon: <TeamOutlined /> },
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserDto | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const fetchUsers = useCallback(async (role: string) => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await api.post('/api/app/UserManagement/get-users-by-role', { roleName: role });
      const data = Array.isArray(response.data) ? response.data : response.data?.items ?? [];
      setUsers(data);
    } catch (error: any) {
      console.error(error);
      setUsers([]);
      setErrorText(
        error?.response?.status === 401
          ? 'Oturum süresi doldu ya da yetkiniz yok. Lütfen tekrar giriş yapın.'
          : 'Kullanıcılar yüklenemedi. Backend (http://localhost:5000) çalışıyor mu?'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter, fetchUsers]);

  const createUserAsync = async (input: any): Promise<UserDto> => {
    const response = await api.post('/api/app/UserManagement/create-user', input);
    return response.data;
  };

  const changeUserRole = async (userId: string, roleName: string) => {
    try {
      await api.post('/api/app/UserManagement/set-user-role', { userId, roleName });
      message.success('Kullanıcının rolü güncellendi');
      fetchUsers(roleFilter);
    } catch (error) {
      message.error('Rol güncellenemedi');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.post('/api/app/UserManagement/delete-user', { userId });
      message.success('Kullanıcı silindi');
      fetchUsers(roleFilter);
    } catch (error) {
      message.error('Kullanıcı silinemedi');
    }
  };

  const openEditModal = (user: UserDto) => {
    setSelectedUserForEdit(user);
    setIsEditModalVisible(true);
  };

  const saveEditedUser = async () => {
    if (!selectedUserForEdit) return;
    try {
      const passwordValue = showPasswordSection && newPassword ? newPassword : undefined;

      await api.post('/api/app/UserManagement/update-user', {
        userId: selectedUserForEdit.id,
        userName: selectedUserForEdit.userName || '',
        email: selectedUserForEdit.email || '',
        name: selectedUserForEdit.name || '',
        surname: selectedUserForEdit.surname || '',
        phoneNumber: selectedUserForEdit.phoneNumber || '',
        address: selectedUserForEdit.address || '',
        password: passwordValue,
        roleName: selectedUserForEdit.roleName || ''
      });

      if (showPasswordSection) {
        if (!newPassword) {
          message.error('Lütfen yeni şifreyi girin');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          message.error('şifreler eşleşmiyor');
          return;
        }
        if (newPassword.length < 6) {
          message.error('şifre en az 6 karakter olmalıdır');
          return;
        }
        message.success('Kullanıcı şifresi güncellendi');
      }

      message.success('Kullanıcı başarıyla güncellendi');
      setIsEditModalVisible(false);
      setSelectedUserForEdit(null);
      setShowPasswordSection(false);
      setNewPassword('');
      setConfirmNewPassword('');
      fetchUsers(roleFilter);
    } catch (error) {
      console.error(error);
      message.error('Kullanıcı kaydedilemedi: ' + (error as any)?.response?.data?.message || 'Bilinmeyen hata');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (u.userName || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.name || '').toLowerCase().includes(s) ||
      (u.surname || '').toLowerCase().includes(s)
    );
  });

  const columns = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ad Soyad',
      key: 'fullName',
      render: (_: any, record: UserDto) => [record.name, record.surname].filter(Boolean).join(' ') || '-',
    },
    {
      title: 'Rol',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (role: string) => {
        const meta = ROLE_META[role];
        return (
          <Tag color={meta?.color || 'default'} icon={meta?.icon}>
            {meta?.label || role || '-'}
          </Tag>
        );
      },
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      render: (v: string) => v || '-',
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (v: string) => v || '-',
    },
    {
      title: 'Adres',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (v: string) => (v ? <Text ellipsis={{ tooltip: v }}>{v}</Text> : '-'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 280,
      render: (_: any, record: UserDto) => (
        <Space size="small" wrap>
          <Select
            size="small"
            value={record.roleName}
            style={{ width: 130 }}
            onChange={(value) => changeUserRole(record.id, value)}
            options={ROLE_FILTERS.filter(r => r.value).map(r => ({ value: r.value, label: r.label }))}
          />
          <Popconfirm
            title="Kullanıcı silinsin mi?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteUser(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
          <Popconfirm
            title="Kullanıcıyı düzenlemek istiyor musunuz?"
            okText="Evet, Düzenle"
            cancelText="Hayır"
            onConfirm={() => openEditModal(record)}
          >
            <Button size="small" icon={<EditOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#ff7a00' }}>
            <TeamOutlined /> Kullanıcı Yönetimi
          </Title>
          <Text type="secondary">
            Eczacı, depocu, tedarikçi ve admin hesapları tek ekrandan yönetilir.
          </Text>
        </div>

        <Space wrap>
          <Input
            allowClear
            placeholder="Kullanıcı ara..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            value={roleFilter}
            style={{ width: 180 }}
            onChange={(value) => setRoleFilter(value)}
            options={ROLE_FILTERS}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchUsers(roleFilter)} loading={loading}>
            Yenile
          </Button>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsCreateModalVisible(true)} style={{ background: '#ff7a00', borderColor: '#ff7a00' }}>
            Yeni Kullanıcı Ekle
          </Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { key: 'Admin', label: 'Admin' },
          { key: 'PharmacyAdmin', label: 'Eczacı' },
          { key: 'WarehouseAdmin', label: 'Depocu' },
          { key: 'Supplier', label: 'Tedarikçi' },
        ].map(item => {
          const count = users.filter(u => u.roleName === item.key).length;
          const meta = ROLE_META[item.key];
          return (
            <Col xs={12} md={6} key={item.key}>
              <Card size="small" style={{ borderColor: '#ffe0c2', background: '#fff9f5' }}>
                <Space>
                  <span style={{ color: '#ff7a00', fontSize: 20 }}>{meta?.icon}</span>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>{roleFilter || search ? count : ''}</div>
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {errorText && (
        <Alert type="warning" showIcon message={errorText} style={{ marginBottom: 16 }} />
      )}

      <Spin spinning={loading}>
        <Table
          columns={columns as any}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </Spin>

      <CreateUserModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          fetchUsers(roleFilter);
          message.success('Kullanıcı başarıyla oluşturuldu');
        }}
        createUserAsync={createUserAsync}
      />

      <Modal
        title={<span style={{ color: '#ff7a00' }}>Kullanıcıyı Düzenle</span>}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>İptal</Button>,
          <Button key="save" type="primary" onClick={saveEditedUser} style={{ background: '#ff7a00', borderColor: '#ff7a00' }}>
            Kaydet
          </Button>
        ]}
        width={500}
      >
        {selectedUserForEdit && (
          <Form layout="vertical">
            <Divider orientationMargin={0}>Temel Bilgiler</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Kullanıcı Adı" name="userName">
                  <Input
                    value={selectedUserForEdit.userName || ''}
                    onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, userName: e.target.value })}
                    prefix={<UserOutlined style={{ color: '#ff7a00' }} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="E-posta" name="email">
                  <Input
                    value={selectedUserForEdit.email || ''}
                    onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })}
                    prefix={<MailOutlined style={{ color: '#ff7a00' }} />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ad" name="name">
                  <Input value={selectedUserForEdit.name || ''} onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Soyad" name="surname">
                  <Input value={selectedUserForEdit.surname || ''} onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, surname: e.target.value })} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Telefon" name="phoneNumber">
                  <Input value={selectedUserForEdit.phoneNumber || ''} onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, phoneNumber: e.target.value })} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Rol" name="roleName">
                  <Select
                    value={selectedUserForEdit.roleName}
                    onChange={(value) => setSelectedUserForEdit({ ...selectedUserForEdit, roleName: value })}
                    options={ROLE_FILTERS.filter(r => r.value).map(r => ({ value: r.value, label: r.label }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Adres" name="address">
              <Input.TextArea
                rows={3}
                value={selectedUserForEdit.address || ''}
                onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, address: e.target.value })}
              />
            </Form.Item>

            <Divider orientationMargin={0}>
              <span style={{ color: '#ff7a00', fontWeight: 700 }}><LockOutlined /> Şifre Değişikliği</span>
            </Divider>

            <div style={{ background: '#fff9f5', padding: '12px 16px', borderRadius: 8, border: '1px solid #ffe0c2', marginBottom: 16 }}>
              <Space>
                <Button
                  type={showPasswordSection ? 'primary' : 'default'}
                  size="small"
                  onClick={() => {
                    setShowPasswordSection(!showPasswordSection);
                    if (!showPasswordSection) {
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }
                  }}
                  style={{ background: showPasswordSection ? '#ff7a00' : undefined, color: showPasswordSection ? '#fff' : undefined }}
                >
                  {showPasswordSection ? 'Şifre Alanı Aktif' : 'Şifre Değiştir'}
                </Button>
              </Space>
            </div>

            {showPasswordSection && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Yeni Şifre">
                    <Input.Password
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      prefix={<LockOutlined style={{ color: '#ff7a00' }} />}
                      placeholder="Yeni şifre"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Şifreyi Onayla">
                    <Input.Password
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      prefix={<LockOutlined style={{ color: '#ff7a00' }} />}
                      placeholder="Tekrar girin"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        )}
      </Modal>
    </Card>
  );
}
