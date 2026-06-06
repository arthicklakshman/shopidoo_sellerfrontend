import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; 
import shopidooLogo from '../../assets/Shopidoo_logo.png'; 

export default function OnboardingHeader({ step = 1 }) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        
        {/* Logo */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
        >
          {/* 🌟 2. Use the imported variable name here instead of a hardcoded string */}
          <Box component="img" src={shopidooLogo} sx={{ height: 50, width: 'auto' }} alt="Shopidoo" />
        </Box>
        
        {/* Subtitle */}
        <Typography sx={{ color: '#6b7280', fontSize: '1.05rem', fontWeight: 400 }}>
          Seller Onboarding
        </Typography>
      </Box>
    </Box>
  );
}