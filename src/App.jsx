// import { useMemo } from 'react';
// import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
// import { useSelector } from 'react-redux';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { lightTheme, darkTheme } from './theme/theme';
// import AppRouter from './router/index';

// const App = () => {
//   const { themeMode } = useSelector((s) => s.ui);
//   const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

//   return (
//     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <GlobalStyles styles={{
//           'html': {
//             zoom: '0.8',
//             scrollbarWidth: 'none', /* Firefox */
//             msOverflowStyle: 'none', /* IE and Edge */
//           },
//           'html::-webkit-scrollbar, body::-webkit-scrollbar': {
//             display: 'none', /* Chrome, Safari, Opera */
//           },
//           'html, body': {
//             overflowX: 'clip',
//             width: '100%',
//             margin: 0,
//             padding: 0
//           },
//           'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear': {
//             display: 'none',
//           }
//         }} />
//         <AppRouter />
//       </ThemeProvider>
//     </GoogleOAuthProvider>
//   );
// };

// export default App;


import { useMemo } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lightTheme, darkTheme } from './theme/theme';
import AppRouter from './router/index';

// Change this single value to control the zoom-out level.
// 0.8 = 80% size (what you had with zoom: 0.8)
const APP_SCALE = 0.8;

const App = () => {
  const { themeMode } = useSelector((s) => s.ui);
  const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            'html, body': {
              overflow: 'hidden',
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 0,
            },
            'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear': {
              display: 'none',
            },
            // #root / #app is whatever your index.html mount div is
            '#root': {
              width: '100%',
              height: '100%',
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

        {/* Scaled wrapper — this replaces `zoom` */}
        <Box
          id="app-scroll-container"
          sx={{
            transform: `scale(${APP_SCALE})`,
            transformOrigin: 'top left',
            width: `${100 / APP_SCALE}%`,
            height: `${100 / APP_SCALE}vh`,
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