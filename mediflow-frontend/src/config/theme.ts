import type { ThemeConfig } from 'antd';

/**
 * MediFlow ERP — Healthcare / Pharma SaaS Design System
 *
 * Renk Psikolojisi:
 *   Medical Blue (#1D4ED8): Güven, profesyonellik, sağlık sektörü standartı
 *   Brand Orange (#FF7A00): Aksiyon butonları, vurgu
 *   Slate palette: Klinik temizlik, göz yormayan okunabilirlik
 */
export const mediflowTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1D4ED8',
    colorLink: '#1D4ED8',
    colorSuccess: '#059669',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#0EA5E9',

    colorTextBase: '#0F172A',
    colorBgBase: '#FFFFFF',

    colorBgLayout: '#F1F5F9',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',

    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',

    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    boxShadowTertiary: '0 1px 4px rgba(0,0,0,0.04)',
    boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.06)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',

    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    lineHeight: 1.6,
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: 'transparent',
      bodyBg: '#F1F5F9',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255, 122, 0, 0.15)',
      darkItemHoverBg: 'rgba(255, 122, 0, 0.08)',
      itemHeight: 46,
      itemPaddingInline: '16px 12px',
    },
    Card: {
      borderRadius: 16,
      padding: 0,
      headerBg: 'transparent',
    },
    Table: {
      borderRadius: 12,
      borderColor: '#E2E8F0',
      headerBg: '#F8FAFC',
      headerColor: '#475569',
      rowHoverBg: '#F8FAFC',
      padding: 16,
    },
    Button: {
      borderRadius: 10,
      algorithm: true,
      controlHeight: 42,
    },
    Form: {
      itemMarginBottom: 18,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 42,
    },
    Modal: {
      borderRadiusLG: 20,
      borderRadius: 20,
      paddingContentHorizontal: 28,
      paddingContentVertical: 24,
    },
  },
};
