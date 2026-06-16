import React from 'react';
import { Button } from '@mui/material';

const GradientOutlineButton = ({ 
  children, 
  sx = {}, 
  ...props 
}) => {
  return (
    <Button
      variant="outlined"
      sx={{
        textTransform: 'none',
        color: '#111827',
        borderRadius: '6px', // Default to 6px, but can be overridden
        fontWeight: 500,
        border: '1px solid transparent',
        background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%) border-box',
        '&:hover': {
          background: 'linear-gradient(#f9fafb, #f9fafb) padding-box, linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%) border-box',
        },
        '&.Mui-disabled': {
           background: '#fff padding-box, #d1d5db border-box',
           color: '#9ca3af'
        },
        ...sx, // This allows you to add custom padding or sizing when you use it!
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientOutlineButton;