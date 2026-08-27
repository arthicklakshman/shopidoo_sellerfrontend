import { useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lightTheme, darkTheme } from './theme/theme';
import AppRouter from './router/index';
import { fetchMe } from './features/auth/authSlice';

// Change this single value to control the zoom-out level.
// 0.8 = 80% size (what you had with zoom: 0.8)
const APP_SCALE = 0.8;

const App = () => {
  const dispatch = useDispatch();
  const { themeMode } = useSelector((s) => s.ui);
  const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            'html, body': {
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 0,
            },
            body: {
              overflow: 'hidden',
            },
            'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear': {
              display: 'none',
            },
            
            '#root': {
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            },
            '#app-scroll-container::-webkit-scrollbar': {
              display: 'none',
            },
            '#app-scroll-container': {
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            },
          }}
        />

        
        <Box
          id="app-scroll-container"
          sx={{
            transform: { xs: 'none', md: `scale(${APP_SCALE})` },
            transformOrigin: 'top left',
            width: { xs: '100%', md: `${100 / APP_SCALE}%` },
            height: { xs: '100vh', md: `${100 / APP_SCALE}vh` },
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <AppRouter />
        </Box>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;