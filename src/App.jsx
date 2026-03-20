import { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from './theme/theme';
import AppRouter from './router/index';

const App = () => {
  const { themeMode } = useSelector((s) => s.ui);
  const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
};

export default App;
