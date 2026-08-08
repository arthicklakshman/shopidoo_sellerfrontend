import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { useDispatch } from 'react-redux';
import shopidooLogo from '../../assets/Shopidoo_logo.png'; 
import SaveAndExit from '../../features/onboarding/components/SaveAndExit';
import { logoutSeller } from '../../features/auth/authSlice';

export default function OnboardingHeader({ step = 1 }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogoClick = async (e) => {
    e.preventDefault();
    try {
      await dispatch(logoutSeller());
    } catch (err) {
      console.error(err);
    }
    navigate('/login');
  };

  return (
    <Box 
      component="header"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: { xs: 2, md: 4, lg: 6 },
        py: 2, 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'sans-serif'
      }}
    >
      {/* Left side: Logo and Title */}
      <Box 
        onClick={handleLogoClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          textDecoration: 'none', 
          color: 'inherit',
          cursor: 'pointer',
          '&:hover': { opacity: 0.85 }
        }}
      >
        {/* Logo */}
        <Box component="img" src={shopidooLogo} sx={{ height: 50, width: 'auto' }} alt="Shopidoo" />
        
        {/* Subtitle */}
        <Typography sx={{ color: '#6b7280', fontSize: '1.05rem', fontWeight: 400, display: { xs: 'none', sm: 'block' } }}>
          Seller Onboarding
        </Typography>
      </Box>

      {/* Right side: Save & Exit button */}
      <SaveAndExit step={step} />
    </Box>
  );
}