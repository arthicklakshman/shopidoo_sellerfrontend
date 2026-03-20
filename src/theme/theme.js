import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 800 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none' },
};

const baseComponents = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 8, padding: '10px 24px' },
      contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
    },
  },
  MuiChip: {
    styleOverrides: { root: { borderRadius: 6 } },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6', contrastText: '#fff' },
    secondary: { main: '#10B981', light: '#34D399', dark: '#059669', contrastText: '#fff' },
    background: { default: '#F5F3FF', paper: '#FFFFFF' },
    success: { main: '#059669' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
  },
  typography: baseTypography,
  components: baseComponents,
  shape: { borderRadius: 8 },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#A78BFA', light: '#C4B5FD', dark: '#7C3AED', contrastText: '#000' },
    secondary: { main: '#34D399', light: '#6EE7B7', dark: '#10B981', contrastText: '#000' },
    background: { default: '#0D0A1A', paper: '#1A1428' },
    success: { main: '#34D399' },
    warning: { main: '#FBBF24' },
    error: { main: '#F87171' },
  },
  typography: baseTypography,
  components: {
    ...baseComponents,
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', backgroundImage: 'none' },
      },
    },
  },
  shape: { borderRadius: 8 },
});
