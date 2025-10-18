export const theme = {
  colors: {
    primary: '#20AC9F',
    'primary-dark': '#1a8a7f',
    'primary-light': '#e8f5f4',
    secondary: '#f2ecedff',
    'secondary-dark': '#24b81fff',
    'secondary-light': '#f7f0d9',
    success: '#28a745',
    'success-light': '#d4edda',
    warning: '#ffc107',
    'warning-light': '#fff3cd',
    danger: '#dc3545',
    'danger-light': '#f8d7da',
    info: '#17a2b8',
    'info-light': '#d1ecf1',
    
    // Cores de fundo
    background: '#f8f9fa',
    surface: '#ffffff',
    'surface-hover': '#f8f9fa',
    
    // Cores de texto
    text: '#212529',
    'text-secondary': '#6c757d',
    'text-light': '#adb5bd',
    
    // Cores de borda
    border: '#dee2e6',
    'border-light': '#e9ecef',
    
    // Cores de sombra
    shadow: 'rgba(0, 0, 0, 0.1)',
    'shadow-light': 'rgba(0, 0, 0, 0.05)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.1)',
  },
  
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
  
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
};

export default theme;
