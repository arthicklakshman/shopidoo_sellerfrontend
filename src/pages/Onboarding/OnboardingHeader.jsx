import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; 
import shopidooLogo from '../../assets/Shopidoo_logo.png'; 
import SaveAndExit from '../../features/onboarding/components/SaveAndExit';

export default function OnboardingHeader({ step = 1 }) {
  return (
    <Box 
      component="header"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: { xs: 2, md: 4, lg: 6 },
        py: { xs: 1.5, sm: 2 }, 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'sans-serif'
      }}
    >
      {/* Left side: Logo and Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}> 
        
        {/* Logo */}
        <Box 
          component={RouterLink} 
          to="/login" 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
        >
          <Box 
            component="img" 
            src={shopidooLogo} 
            sx={{ 
              height: { xs: 32, sm: 50 }, 
              width: 'auto' 
            }} 
            alt="Shopidoo" 
          />
        </Box>
        
        {/* Subtitle */}
        <Typography sx={{ 
          color: '#6b7280', 
          fontSize: { xs: '0.85rem', sm: '1.05rem' }, 
          fontWeight: 400 
        }}>
          Seller Onboarding
        </Typography>
      </Box>

      {/* Right side: Save & Exit button */}
      <SaveAndExit step={step} />
    </Box>
  );
}