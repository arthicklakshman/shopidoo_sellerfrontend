import { useMemo } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { useSelector } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lightTheme, darkTheme } from './theme/theme';
import AppRouter from './router/index';

const App = () => {
  const { themeMode } = useSelector((s) => s.ui);
  const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{
          'html': {
            zoom: '0.8',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
          },
          'html::-webkit-scrollbar, body::-webkit-scrollbar': {
            display: 'none', /* Chrome, Safari, Opera */
          },
          'html, body': {
            overflowX: 'clip',
            width: '100%',
            margin: 0,
            padding: 0
          },
          'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear': {
            display: 'none',
          }
        }} />
        <AppRouter />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
