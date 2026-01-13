/**
 * 🎨 Cybertech Dark Theme - نظام الألوان السايبرتك الداكن
 * ARC Design System v2.0
 */

export const cybertechTheme = {
  name: 'Cybertech Dark',
  version: '2.0.0',
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 🌑 Core Colors - الألوان الأساسية
  // ═══════════════════════════════════════════════════════════════════════════════
  
  colors: {
    // Background Colors - ألوان الخلفية
    background: {
      primary: '#0a0e17',      // الخلفية الرئيسية - أسود فضائي
      secondary: '#111827',    // الخلفية الثانوية - رمادي داكن
      tertiary: '#1a1f2e',     // الخلفية الثالثة - رمادي مزرق
      elevated: '#1e2433',     // العناصر المرتفعة
      overlay: 'rgba(0, 0, 0, 0.8)', // طبقة التراكب
      glass: 'rgba(17, 24, 39, 0.7)', // تأثير الزجاج
    },
    
    // Surface Colors - ألوان الأسطح
    surface: {
      card: '#151b28',
      cardHover: '#1a2235',
      border: '#2d3748',
      borderLight: '#374151',
      divider: 'rgba(75, 85, 99, 0.3)',
    },
    
    // Primary Colors - الألوان الأساسية (سماوي نيون)
    primary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',    // اللون الأساسي
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      DEFAULT: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
    },
    
    // Accent Colors - ألوان التمييز (بنفسجي كهربائي)
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',    // اللون المميز
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      DEFAULT: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.4)',
    },
    
    // Success Colors - ألوان النجاح (أخضر نيون)
    success: {
      light: '#86efac',
      DEFAULT: '#22c55e',
      dark: '#16a34a',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
    
    // Warning Colors - ألوان التحذير (برتقالي ذهبي)
    warning: {
      light: '#fde047',
      DEFAULT: '#eab308',
      dark: '#ca8a04',
      glow: 'rgba(234, 179, 8, 0.4)',
    },
    
    // Error Colors - ألوان الخطأ (أحمر ناري)
    error: {
      light: '#fca5a5',
      DEFAULT: '#ef4444',
      dark: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    
    // Info Colors - ألوان المعلومات
    info: {
      light: '#93c5fd',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
      glow: 'rgba(59, 130, 246, 0.4)',
    },
    
    // Text Colors - ألوان النص
    text: {
      primary: '#f9fafb',      // أبيض مائل للرمادي
      secondary: '#9ca3af',    // رمادي فاتح
      tertiary: '#6b7280',     // رمادي متوسط
      disabled: '#4b5563',     // رمادي داكن
      inverse: '#111827',      // للنص على خلفيات فاتحة
    },
    
    // Agent Layer Colors - ألوان طبقات الوكلاء
    layers: {
      executive: {
        primary: '#fbbf24',    // ذهبي
        secondary: '#f59e0b',
        glow: 'rgba(251, 191, 36, 0.4)',
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      },
      administrative: {
        primary: '#06b6d4',    // سماوي
        secondary: '#0891b2',
        glow: 'rgba(6, 182, 212, 0.4)',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      },
      productive: {
        primary: '#22c55e',    // أخضر
        secondary: '#16a34a',
        glow: 'rgba(34, 197, 94, 0.4)',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      },
    },
    
    // IoT Device Status Colors - ألوان حالة الأجهزة
    device: {
      online: '#22c55e',
      offline: '#6b7280',
      error: '#ef4444',
      maintenance: '#eab308',
    },
    
    // Chart Colors - ألوان الرسوم البيانية
    chart: {
      series: [
        '#06b6d4', // سماوي
        '#a855f7', // بنفسجي
        '#22c55e', // أخضر
        '#f59e0b', // برتقالي
        '#ef4444', // أحمر
        '#ec4899', // وردي
        '#8b5cf6', // بنفسجي فاتح
        '#14b8a6', // تيل
      ],
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // ✨ Effects - التأثيرات
  // ═══════════════════════════════════════════════════════════════════════════════
  
  effects: {
    // Glow Effects - تأثيرات التوهج
    glow: {
      primary: '0 0 20px rgba(6, 182, 212, 0.4)',
      accent: '0 0 20px rgba(168, 85, 247, 0.4)',
      success: '0 0 20px rgba(34, 197, 94, 0.4)',
      warning: '0 0 20px rgba(234, 179, 8, 0.4)',
      error: '0 0 20px rgba(239, 68, 68, 0.4)',
      strong: '0 0 40px rgba(6, 182, 212, 0.6)',
    },
    
    // Shadow Effects - تأثيرات الظل
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
      card: '0 4px 20px rgba(0, 0, 0, 0.4)',
    },
    
    // Glass Effect - تأثير الزجاج
    glass: {
      background: 'rgba(17, 24, 39, 0.7)',
      backdropBlur: 'blur(12px)',
      border: '1px solid rgba(75, 85, 99, 0.3)',
    },
    
    // Gradient Effects - تأثيرات التدرج
    gradients: {
      primary: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      accent: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      warning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      cyber: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)',
      dark: 'linear-gradient(180deg, #0a0e17 0%, #111827 100%)',
      radial: 'radial-gradient(ellipse at center, #1a2235 0%, #0a0e17 100%)',
      mesh: `
        radial-gradient(at 40% 20%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(34, 197, 94, 0.1) 0px, transparent 50%),
        radial-gradient(at 80% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)
      `,
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 📐 Typography - الخطوط
  // ═══════════════════════════════════════════════════════════════════════════════
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      arabic: ['Noto Sans Arabic', 'Segoe UI', 'sans-serif'],
      display: ['Space Grotesk', 'Inter', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 📦 Spacing - المسافات
  // ═══════════════════════════════════════════════════════════════════════════════
  
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔲 Border Radius - انحناء الحواف
  // ═══════════════════════════════════════════════════════════════════════════════
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.5rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // ⏱️ Animation - الحركة
  // ═══════════════════════════════════════════════════════════════════════════════
  
  animation: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    keyframes: {
      glow: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      pulse: {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      scanLine: {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(100vh)' },
      },
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 Component Tokens - رموز المكونات
  // ═══════════════════════════════════════════════════════════════════════════════
  
  components: {
    button: {
      primary: {
        bg: '#06b6d4',
        bgHover: '#0891b2',
        text: '#111827',
        shadow: '0 0 20px rgba(6, 182, 212, 0.4)',
      },
      secondary: {
        bg: 'transparent',
        bgHover: 'rgba(6, 182, 212, 0.1)',
        text: '#06b6d4',
        border: '#06b6d4',
      },
      accent: {
        bg: '#a855f7',
        bgHover: '#9333ea',
        text: '#ffffff',
        shadow: '0 0 20px rgba(168, 85, 247, 0.4)',
      },
      danger: {
        bg: '#ef4444',
        bgHover: '#dc2626',
        text: '#ffffff',
        shadow: '0 0 20px rgba(239, 68, 68, 0.4)',
      },
    },
    card: {
      bg: '#151b28',
      bgHover: '#1a2235',
      border: '#2d3748',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    },
    input: {
      bg: '#111827',
      bgFocus: '#1a1f2e',
      border: '#374151',
      borderFocus: '#06b6d4',
      text: '#f9fafb',
      placeholder: '#6b7280',
    },
    sidebar: {
      bg: '#0a0e17',
      bgItem: 'transparent',
      bgItemHover: 'rgba(6, 182, 212, 0.1)',
      bgItemActive: 'rgba(6, 182, 212, 0.2)',
      textItem: '#9ca3af',
      textItemActive: '#06b6d4',
      border: '#1e2433',
    },
    navbar: {
      bg: 'rgba(10, 14, 23, 0.9)',
      bgBlur: 'blur(12px)',
      border: '#1e2433',
    },
    modal: {
      bg: '#151b28',
      overlay: 'rgba(0, 0, 0, 0.8)',
      border: '#2d3748',
    },
    table: {
      headerBg: '#111827',
      rowBg: 'transparent',
      rowBgHover: 'rgba(6, 182, 212, 0.05)',
      border: '#2d3748',
    },
    badge: {
      success: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
      warning: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
      error: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
      info: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
      default: { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' },
    },
  },
};

// CSS Custom Properties Export
export const cssVariables = `
:root {
  /* Background */
  --bg-primary: ${cybertechTheme.colors.background.primary};
  --bg-secondary: ${cybertechTheme.colors.background.secondary};
  --bg-tertiary: ${cybertechTheme.colors.background.tertiary};
  --bg-elevated: ${cybertechTheme.colors.background.elevated};
  
  /* Surface */
  --surface-card: ${cybertechTheme.colors.surface.card};
  --surface-border: ${cybertechTheme.colors.surface.border};
  
  /* Primary */
  --color-primary: ${cybertechTheme.colors.primary.DEFAULT};
  --color-primary-light: ${cybertechTheme.colors.primary[300]};
  --color-primary-dark: ${cybertechTheme.colors.primary[700]};
  --color-primary-glow: ${cybertechTheme.colors.primary.glow};
  
  /* Accent */
  --color-accent: ${cybertechTheme.colors.accent.DEFAULT};
  --color-accent-light: ${cybertechTheme.colors.accent[300]};
  --color-accent-dark: ${cybertechTheme.colors.accent[700]};
  --color-accent-glow: ${cybertechTheme.colors.accent.glow};
  
  /* Semantic */
  --color-success: ${cybertechTheme.colors.success.DEFAULT};
  --color-warning: ${cybertechTheme.colors.warning.DEFAULT};
  --color-error: ${cybertechTheme.colors.error.DEFAULT};
  --color-info: ${cybertechTheme.colors.info.DEFAULT};
  
  /* Text */
  --text-primary: ${cybertechTheme.colors.text.primary};
  --text-secondary: ${cybertechTheme.colors.text.secondary};
  --text-tertiary: ${cybertechTheme.colors.text.tertiary};
  
  /* Layer Colors */
  --layer-executive: ${cybertechTheme.colors.layers.executive.primary};
  --layer-administrative: ${cybertechTheme.colors.layers.administrative.primary};
  --layer-productive: ${cybertechTheme.colors.layers.productive.primary};
  
  /* Effects */
  --glow-primary: ${cybertechTheme.effects.glow.primary};
  --shadow-card: ${cybertechTheme.effects.shadow.card};
  
  /* Animation */
  --duration-fast: ${cybertechTheme.animation.durations.fast};
  --duration-normal: ${cybertechTheme.animation.durations.normal};
  --easing-default: ${cybertechTheme.animation.easing.easeInOut};
}
`;

export default cybertechTheme;
