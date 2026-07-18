import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Fab, Snackbar, Alert } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsApp = ({ supportNumber = "919876543210" }) => {
  const [toastOpen, setToastOpen] = useState(false);

  const handleClick = () => {
    // 1. Show the Shopidoo Toast
    setToastOpen(true);

    // 2. Open WhatsApp chat directly to the number
    const waLink = `https://wa.me/${supportNumber}`;
    
    // Slight delay to allow the toast to render before redirecting
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
      {createPortal(
        <Fab
          color="success"
          aria-label="whatsapp"
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 90, 
            right: 24,
            backgroundColor: '#25D366', 
            '&:hover': {
              backgroundColor: '#128C7E',
            },
            zIndex: 1000,
            transform: 'scale(0.8)',
            transformOrigin: 'bottom right',
          }}
        >
          <WhatsAppIcon style={{ color: 'white' }} />
        </Fab>,
        document.body
      )}

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