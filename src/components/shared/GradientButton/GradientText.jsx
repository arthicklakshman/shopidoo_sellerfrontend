import React from 'react';
import { Typography } from '@mui/material';

const GradientText = ({ children, sx = {}, ...props }) => {
  return (
    <Typography
      sx={{
        background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block', // Prevents the edges of the text from getting clipped
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default GradientText;