import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Cores principais */
    --primary: ${theme.colors.primary};
    --primary-dark: ${theme.colors['primary-dark']};
    --primary-light: ${theme.colors['primary-light']};
    --secondary: ${theme.colors.secondary};
    --secondary-dark: ${theme.colors['secondary-dark']};
    --secondary-light: ${theme.colors['secondary-light']};
    
    /* Cores de status */
    --success: ${theme.colors.success};
    --success-light: ${theme.colors['success-light']};
    --warning: ${theme.colors.warning};
    --warning-light: ${theme.colors['warning-light']};
    --danger: ${theme.colors.danger};
    --danger-light: ${theme.colors['danger-light']};
    --info: ${theme.colors.info};
    --info-light: ${theme.colors['info-light']};
    
    /* Cores de fundo */
    --background: ${theme.colors.background};
    --surface: ${theme.colors.surface};
    --surface-hover: ${theme.colors['surface-hover']};
    
    /* Cores de texto */
    --text: ${theme.colors.text};
    --text-secondary: ${theme.colors['text-secondary']};
    --text-light: ${theme.colors['text-light']};
    
    /* Cores de borda */
    --border: ${theme.colors.border};
    --border-light: ${theme.colors['border-light']};
    
    /* Cores de sombra */
    --shadow: ${theme.colors.shadow};
    --shadow-light: ${theme.colors['shadow-light']};
    
    /* Espaçamentos */
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    
    /* Bordas arredondadas */
    --border-radius-sm: ${theme.borderRadius.sm};
    --border-radius-md: ${theme.borderRadius.md};
    --border-radius-lg: ${theme.borderRadius.lg};
    --border-radius-xl: ${theme.borderRadius.xl};
    --border-radius-round: ${theme.borderRadius.round};
    
    /* Sombras */
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    --shadow-xl: ${theme.shadows.xl};
    
    /* Breakpoints */
    --breakpoint-mobile: ${theme.breakpoints.mobile};
    --breakpoint-tablet: ${theme.breakpoints.tablet};
    --breakpoint-desktop: ${theme.breakpoints.desktop};
    
    /* Transições */
    --transition-fast: ${theme.transitions.fast};
    --transition-normal: ${theme.transitions.normal};
    --transition-slow: ${theme.transitions.slow};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.normal};
    line-height: ${theme.typography.lineHeight.normal};
    color: var(--text);
    background-color: var(--background);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.typography.fontFamily.secondary};
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    margin-bottom: var(--spacing-md);
  }

  h1 { font-size: ${theme.typography.fontSize['5xl']}; }
  h2 { font-size: ${theme.typography.fontSize['4xl']}; }
  h3 { font-size: ${theme.typography.fontSize['3xl']}; }
  h4 { font-size: ${theme.typography.fontSize['2xl']}; }
  h5 { font-size: ${theme.typography.fontSize.xl}; }
  h6 { font-size: ${theme.typography.fontSize.lg}; }

  p {
    margin-bottom: var(--spacing-md);
    line-height: ${theme.typography.lineHeight.relaxed};
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--primary-dark);
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Utilitários */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  
  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: var(--spacing-xs); }
  .mb-2 { margin-bottom: var(--spacing-sm); }
  .mb-3 { margin-bottom: var(--spacing-md); }
  .mb-4 { margin-bottom: var(--spacing-lg); }
  .mb-5 { margin-bottom: var(--spacing-xl); }
  
  .mt-0 { margin-top: 0; }
  .mt-1 { margin-top: var(--spacing-xs); }
  .mt-2 { margin-top: var(--spacing-sm); }
  .mt-3 { margin-top: var(--spacing-md); }
  .mt-4 { margin-top: var(--spacing-lg); }
  .mt-5 { margin-top: var(--spacing-xl); }
  
  .p-0 { padding: 0; }
  .p-1 { padding: var(--spacing-xs); }
  .p-2 { padding: var(--spacing-sm); }
  .p-3 { padding: var(--spacing-md); }
  .p-4 { padding: var(--spacing-lg); }
  .p-5 { padding: var(--spacing-xl); }

  /* Responsividade */
  @media (max-width: ${theme.breakpoints.mobile}) {
    html {
      font-size: 14px;
    }
    
    h1 { font-size: ${theme.typography.fontSize['4xl']}; }
    h2 { font-size: ${theme.typography.fontSize['3xl']}; }
    h3 { font-size: ${theme.typography.fontSize['2xl']}; }
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--surface);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: var(--border-radius-round);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-light);
  }
`;

export default GlobalStyles;
