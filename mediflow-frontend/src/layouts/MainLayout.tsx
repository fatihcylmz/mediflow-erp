import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Badge, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, MedicineBoxOutlined, ShoppingCartOutlined, InboxOutlined,
  CarOutlined, FileTextOutlined, ExperimentOutlined, DollarOutlined,
  RollbackOutlined, TagOutlined, TeamOutlined, UserOutlined,
  LogoutOutlined, DatabaseOutlined, ShopOutlined, TruckOutlined,
  FileProtectOutlined, SettingOutlined, BellOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

type RoleType = 'admin' | 'pharmacy' | 'supplier' | 'warehouse';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const currentRole = (localStorage.getItem('role') || null) as RoleType | null;
  const currentUser = localStorage.getItem('username') || 'Kullanıcı';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  const userMenu: MenuProps = {
    items: [
      { key: 'profile', label: `Kullanıcı: ${currentUser}`, icon: <UserOutlined />, disabled: true },
      { type: 'divider' },
      { key: 'logout', label: 'Çıkış Yap', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ],
  };

  const getPanelTitle = (): string => {
    const titles: Record<RoleType, string> = {
      admin: 'Sistem Yönetimi',
      pharmacy: 'Eczane Paneli',
      supplier: 'Tedarikçi Portalı',
      warehouse: 'Depo Yönetimi',
    };
    return titles[currentRole] || 'Yönetim Paneli';
  };

  // Get selected key from URL path
  const getPathKey = (): string => {
    const path = window.location.pathname.split('/')[1];
    if (!path) return 'dashboard';
    return path;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* SOL MENÜ - Beyaz Tema */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        theme="light"
        style={{
          background: '#FFFFFF',
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          transition: 'width 0.2s ease-in-out',
          borderRight: '1px solid #E2E8F0',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            margin: '16px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: 16,
          }}
        >
          {!collapsed && (
            <Space size={10}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #FF7A00, #FF9E4D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MedicineBoxOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <span style={{ color: '#FF7A00', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                MediFLOW
              </span>
            </Space>
          )}
          {collapsed && (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #FF7A00, #FF9E4D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MedicineBoxOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ padding: '8px 0' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getPathKey()]}
            onClick={({ key }) => {
              navigate(`/${currentRole}/${key}`);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              Genel Özet
            </Menu.Item>

            {currentRole === 'admin' && (
              <>
                <Menu.Item key="users" icon={<TeamOutlined />}>
                  Kullanıcı Yönetimi
                </Menu.Item>
                <Menu.Item key="drugs" icon={<MedicineBoxOutlined />}>
                  İlaç Envanteri
                </Menu.Item>
                <Menu.Item key="pricing" icon={<DollarOutlined />}>
                  İlaç Fiyatları
                </Menu.Item>
                <Menu.Item key="ingredients" icon={<ExperimentOutlined />}>
                  Etken Maddeler
                </Menu.Item>
                <Menu.Item key="prescriptions" icon={<FileProtectOutlined />}>
                  Reçeteler
                </Menu.Item>
                <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
                  Siparişler
                </Menu.Item>
                <Menu.Item key="shipments" icon={<CarOutlined />}>
                  Sevkiyatlar
                </Menu.Item>
                <Menu.Item key="invoices" icon={<FileTextOutlined />}>
                  Faturalar
                </Menu.Item>
                <Menu.Item key="inventories" icon={<InboxOutlined />}>
                  Envanter
                </Menu.Item>
                <Menu.Item key="returns" icon={<RollbackOutlined />}>
                  İadeler
                </Menu.Item>
                <Menu.Item key="sales" icon={<TagOutlined />}>
                  Satışlar (POS)
                </Menu.Item>
              </>
            )}

            {currentRole === 'pharmacy' && (
              <>
                <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
                  İlaç Siparişlerim
                </Menu.Item>
                <Menu.Item key="drugs" icon={<MedicineBoxOutlined />}>
                  İlaç Fiyat & Stok
                </Menu.Item>
                <Menu.Item key="prescriptions" icon={<FileProtectOutlined />}>
                  Reçete İşlemleri
                </Menu.Item>
                <Menu.Item key="sales" icon={<TagOutlined />}>
                  Reçete Satış (POS)
                </Menu.Item>
              </>
            )}

            {currentRole === 'supplier' && (
              <>
                <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
                  Gelen Siparişler
                </Menu.Item>
                <Menu.Item key="shipments" icon={<CarOutlined />}>
                  Sevkiyat Yönetimi
                </Menu.Item>
                <Menu.Item key="invoices" icon={<FileTextOutlined />}>
                  Faturalarım
                </Menu.Item>
              </>
            )}

            {currentRole === 'warehouse' && (
              <>
                <Menu.Item key="warehouses" icon={<DatabaseOutlined />}>
                  Depo Yönetimi
                </Menu.Item>
                <Menu.Item key="inventories" icon={<InboxOutlined />}>
                  Stok Takibi
                </Menu.Item>
                <Menu.Item key="shipments" icon={<CarOutlined />}>
                  Depo Sevkiyatları
                </Menu.Item>
              </>
            )}
          </Menu>
        </div>

        {/* Collapse Button */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '12px' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%',
              padding: '10px',
              background: collapsed ? '#FF7A00' : '#F8FAFC',
              border: `1px solid ${collapsed ? '#FF7A00' : '#E2E8F0'}`,
              borderRadius: 10,
              cursor: 'pointer',
              color: collapsed ? '#fff' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            {!collapsed && <span style={{ fontSize: 13 }}>Menüyü Kapat</span>}
          </button>
        </div>
      </Sider>

      {/* ANA İÇERİK ALANI */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        {/* HEADER */}
        <Header
          style={{
            padding: '0 24px',
            background: '#FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 999,
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Text strong style={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>
            {getPanelTitle()}
          </Text>

          <Space size="middle">
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18, color: '#64748B' }} />} />
            </Badge>

            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Avatar style={{ backgroundColor: '#FF7A00', fontSize: 13, color: '#fff' }} icon={<UserOutlined />} />
                <Text strong style={{ color: '#0F172A' }}>{currentUser}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* CONTENT AREA */}
        <Content style={{ margin: '24px', overflowY: 'auto' }}>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 120px)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)',
              borderRadius: 20,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
