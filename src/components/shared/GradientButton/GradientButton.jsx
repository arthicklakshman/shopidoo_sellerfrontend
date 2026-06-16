import React from 'react';
import { Button } from '@mui/material';

const GradientButton = ({ 
  children, 
  onClick, 
  fullWidth = false, 
  sx = {}, 
  ...props 
}) => {
  return (
    <Button
      variant="contained"
      fullWidth={fullWidth}
      sx={{
        py: 1.8,
        borderRadius: '12px',
        textTransform: 'uppercase',
        fontWeight: 800,
        color: '#000000',
        background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
        '&:hover': {
          background: 'linear-gradient(90deg, #0FB9B1 20%, #0B8457 120%)',
          opacity: 0.9,
        },
        // 🌟 FIXED: Explicitly handle the disabled state to override the gradient!
        '&.Mui-disabled': {
          background: '#e5e7eb', // Flat gray background
          color: '#9ca3af',      // Gray text
          boxShadow: 'none',     // Removes any glow
        },
        ...sx, 
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;




// import React from 'react';
// import { Button } from '@mui/material';

// const GradientButton = ({ 
//   children, 
//   onClick, 
//   fullWidth = false, 
//   sx = {}, 
//   ...props 
// }) => {
//   return (
//     <Button
//       variant="contained"
//       fullWidth={fullWidth}
//       sx={{
//         py: 1.8,
//         borderRadius: '12px',
//         textTransform: 'uppercase',
//         fontWeight: 800,
//         color: '#000000',
//         background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
//         '&:hover': {
//           background: 'linear-gradient(90deg, #0FB9B1 20%, #0B8457 120%)',
//           opacity: 0.9,
//         },
//         ...sx, // Allows you to pass additional styles when calling the component
//       }}
//       onClick={onClick}
//       {...props}
//     >
//       {children}
//     </Button>
//   );
// };

// export default GradientButton;