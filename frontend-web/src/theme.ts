import { createTheme } from '@mui/material/styles';

export const colors = {
  // Neutral Slate Foundation
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50:  '#F8FAFC',
  white:    '#FFFFFF',

  // Accent & Brand
  accentBlue: '#0EA5E9',
  accentBlueDark: '#0284C7',

  // Status & Verdict Colors
  compliant: '#16A34A',
  compliantBg: '#F0FDF4',
  compliantBorder: '#86EFAC',

  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',

  violation: '#DC2626',
  violationBg: '#FEF2F2',
  violationBorder: '#FCA5A5',

  critical: '#DC2626',
  major: '#EA580C',
  minor: '#475569',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.slate900,
      light: colors.slate800,
      dark: '#020617',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.accentBlue,
      dark: colors.accentBlueDark,
    },
    success: {
      main: colors.compliant,
      light: colors.compliantBg,
    },
    error: {
      main: colors.violation,
      light: colors.violationBg,
    },
    warning: {
      main: colors.warning,
      light: colors.warningBg,
    },
    background: {
      default: colors.slate50,
      paper: colors.white,
    },
    text: {
      primary: colors.slate900,
      secondary: colors.slate600,
    },
    divider: colors.slate200,
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.5rem' },
    h5: { fontWeight: 600, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.125rem' },
    subtitle1: { fontWeight: 600, color: colors.slate800 },
    subtitle2: { fontWeight: 600, color: colors.slate700 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5, color: colors.slate800 },
    body2: { fontSize: '0.84375rem', lineHeight: 1.45, color: colors.slate600 },
    caption: { fontSize: '0.75rem', color: colors.slate500 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.slate50,
          color: colors.slate900,
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        },
        outlined: {
          borderColor: colors.slate200,
        },
      },
      defaultProps: { elevation: 0 },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.slate200}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        },
      },
      defaultProps: { elevation: 0 },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          paddingLeft: 16,
          paddingRight: 16,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: colors.slate900,
          '&:hover': {
            backgroundColor: colors.slate800,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.slate200,
          paddingTop: 12,
          paddingBottom: 12,
          fontSize: '0.84375rem',
        },
        head: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.slate500,
          fontWeight: 600,
          backgroundColor: colors.slate50,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.slate200}`,
          backgroundColor: colors.white,
          color: colors.slate900,
        },
      },
    },
  },
});

export default theme;
