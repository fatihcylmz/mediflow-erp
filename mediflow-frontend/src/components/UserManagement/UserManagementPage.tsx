import { useCallback, useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Select, message, Popconfirm, Input, Row, Col, Spin, Alert, Modal, Form, Divider } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { UserAddOutlined, TeamOutlined, ReloadOutlined, DeleteOutlined, SearchOutlined, ShopOutlined, DatabaseOutlined, TruckOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import CreateUserModal from './CreateUserModal';
import api from '../../services/api';
import { KPICard } from '../../components/charts/DashboardCharts';

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

  const roleStats = [
    { key: 'Admin', label: 'Admin', color: 'volcano', icon: <SafetyCertificateOutlined /> },
    { key: 'PharmacyAdmin', label: 'Eczacı', color: 'green', icon: <ShopOutlined /> },
    { key: 'WarehouseAdmin', label: 'Depocu', color: 'blue', icon: <DatabaseOutlined /> },
    { key: 'Supplier', label: 'Tedarikçi', color: 'orange', icon: <TruckOutlined /> },
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
                <TeamOutlined style={{ color: '#ff7a00', marginRight: 12 }} />
                Kullanıcı Yönetimi
              </Title>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Eczacı, depocu, tedarikçi ve admin hesapları tek ekrandan yönetilir.
              </Text>
            </Col>
            <Col>
              <Space size={12}>
                <Input
                  allowClear
                  placeholder="Kullanıcı ara..."
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 280, borderRadius: 10 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchUsers(roleFilter)}
                  loading={loading}
                  style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)',
                    borderColor: 'transparent',
                    borderRadius: 10,
                    boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)',
                  }}
                >
                  Yeni Kullanıcı Ekle
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* KPI Cards - Modern White Surface */}
        <Row gutter={[16, 16]} style={{ padding: '0 24px 24px' }}>
          <Col xs={24} sm={12} md={6}>
            <KPICard title="Toplam Kullanıcı" value={users.length} subtitle="kayıt" color="#FF7A00" icon={<TeamOutlined />} />
          </Col>
          {roleStats.map((role) => (
            <Col xs={24} sm={12} md={6} key={role.key}>
              <KPICard
                title={role.label}
                value={users.filter(u => u.roleName === role.key).length}
                subtitle="kullanıcı"
                color={role.color === 'volcano' ? '#FAAD14' : role.color === 'green' ? '#059669' : role.color === 'blue' ? '#1D4ED8' : '#FAAD14'}
                icon={role.icon}
              />
            </Col>
          ))}
        </Row>

        {/* Main Table */}
        <div style={{ padding: '0 24px 24px' }}>
          {errorText && (
            <Alert type="warning" showIcon message={errorText} style={{ marginBottom: 16 }} />
          )}

          <Spin spinning={loading}>
            <Table
              columns={columns as any}
              dataSource={filteredUsers}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              bordered={false}
              size="middle"
              className="border border-slate-200 rounded-xl"
              scroll={{ x: 900 }}
              locale={{ emptyText: <Text type="secondary">Henüz kullanıcı kaydı yok</Text> }}
            />
          </Spin>
        </div>
      </Card>

      {/* Create User Modal */}
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
    </div>
  );
}