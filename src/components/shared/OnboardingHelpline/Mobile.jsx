import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Fab, Snackbar, Alert } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

const Mobile = ({ supportNumber = "919876543210" }) => {
  const [toastOpen, setToastOpen] = useState(false);

  const handleClick = () => {
    // 1. Show the Shopidoo Toast
    setToastOpen(true);

    // 2. Trigger the mobile dialer
    const telLink = `tel:+${supportNumber}`;

    // Slight delay to allow the toast to render
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
      {createPortal(
        <Fab
          color="primary"
          aria-label="call"
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 }, // Bottom-most icon
            right: { xs: 4, md: 24 },
            backgroundColor: '#1976d2', // Blue matching the design
            '&:hover': {
              backgroundColor: '#115293',
            },
            zIndex: 1000,
            transform: { xs: 'scale(0.65)', md: 'scale(0.8)' },
            transformOrigin: 'bottom right',
          }}
        >
          <PhoneIcon style={{ color: 'white' }} />
        </Fab>,
        document.body
      )}

      {/* Replace this Snackbar with your global Shopidoo Toast if you have one */}
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