import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fab, Snackbar, Alert } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { fetchSettingsOnce } from '../../../utils/settingsCache';

const WhatsApp = ({ supportNumber }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [activeNumber, setActiveNumber] = useState(supportNumber || "919487082294");

  useEffect(() => {
    if (supportNumber) {
      setActiveNumber(supportNumber);
      return;
    }
    fetchSettingsOnce()
      .then((settings) => {
        if (settings?.supportPhone) {
          const cleaned = settings.supportPhone.replace(/\D/g, '');
          if (cleaned) setActiveNumber(cleaned);
        }
      })
      .catch((err) => console.error('Failed to load whatsapp number:', err));
  }, [supportNumber]);

  const handleClick = () => {
    // 1. Show the Shopidoo Toast
    setToastOpen(true);

    // 2. Open WhatsApp chat directly to the number
    const waLink = `https://wa.me/${activeNumber}`;
    
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
            bottom: { xs: 80, md: 90 }, 
            right: { xs: 4, md: 24 },
            backgroundColor: '#25D366', 
            '&:hover': {
              backgroundColor: '#128C7E',
            },
            zIndex: 1000,
            transform: { xs: 'scale(0.65)', md: 'scale(0.8)' },
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
          Shopidoo Support WhatsApp: +{activeNumber}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WhatsApp;