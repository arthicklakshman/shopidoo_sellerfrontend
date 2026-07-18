import React, { useState } from 'react';
import { Fab, Snackbar, Alert, useTheme, useMediaQuery } from '@mui/material'; // 🌟 Added hooks
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsApp = ({ supportNumber = "919876543210" }) => {
  const [toastOpen, setToastOpen] = useState(false);
  
  // 🌟 Setup responsive checks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  const handleClick = () => {
    setToastOpen(true);
    const waLink = `https://wa.me/${supportNumber}`;
    setTimeout(() => {
      window.open(waLink, '_blank');
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
        color="success"
        aria-label="whatsapp"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 64 : 90, // 🌟 Adjusted so it sits right above the smaller phone icon
          right: isMobile ? 16 : 24,
          backgroundColor: '#25D366', 
          '&:hover': {
            backgroundColor: '#128C7E',
          },
          zIndex: 1000,
        }}
      >
        <WhatsAppIcon style={{ color: 'white' }} />
      </Fab>

      <Snackbar 
        open={toastOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity="success" sx={{ width: '100%' }}>
          Shopidoo Support WhatsApp: +{supportNumber}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WhatsApp;