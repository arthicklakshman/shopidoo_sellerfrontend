import React, { useState } from 'react';
import { Fab, Snackbar, Alert, useTheme, useMediaQuery } from '@mui/material'; // 🌟 Added hooks
import PhoneIcon from '@mui/icons-material/Phone';

const Mobile = ({ supportNumber = "919876543210" }) => {
  const [toastOpen, setToastOpen] = useState(false);
  
  // 🌟 Setup responsive checks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // True on mobile screens

  const handleClick = () => {
    setToastOpen(true);
    const telLink = `tel:+${supportNumber}`;
    setTimeout(() => {
      window.location.href = telLink;
    }, 500);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  return (
    <>
      <Fab
        size={isMobile ? "small" : "large"} // 🌟 Switches to small on mobile
        color="primary"
        aria-label="call"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 24, // 🌟 Tighter spacing for mobile
          right: isMobile ? 16 : 24,
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#115293',
          },
          zIndex: 1000,
        }}
      >
        <PhoneIcon style={{ color: 'white' }} />
      </Fab>

      <Snackbar 
        open={toastOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity="info" sx={{ width: '100%' }}>
          Shopidoo Support Contact: +{supportNumber}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Mobile;