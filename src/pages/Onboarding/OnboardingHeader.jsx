import React from 'react';
import { Box, Typography } from '@mui/material';
import GradientText from '../../components/shared/GradientButton/GradientText'; 

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
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        
        {/* 🌟 So much cleaner! */}
        <GradientText variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>
          SHOPIDOO
        </GradientText>
        
        <Typography sx={{ color: '#6b7280', fontSize: '1.05rem', fontWeight: 400 }}>
          Seller Onboarding
        </Typography>
      </Box>
    </Box>
  );
}