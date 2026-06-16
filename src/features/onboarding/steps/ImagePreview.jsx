import React from 'react';
import { Box, Typography, Modal } from '@mui/material'; // Removed IconButton

// 🌟 Imported GradientButton
import GradientButton from '../../../components/shared/GradientButton/GradientButton';
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // 🌟 INCREASED: Made it wider across different screen sizes
  width: { xs: '95%', sm: '700px', md: '800px' }, 
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  outline: 'none',
  // 🌟 ADDED: Prevents it from getting too tall on small screens
  maxHeight: '90vh', 
};

export default function ImagePreview({ open, onClose, fileData, fileName }) {
  if (!fileData) return null;


// Safely check if it's a string first, then check if it's an image
  const isImage = typeof fileData === 'string' && fileData.startsWith('data:image');

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="document-preview-modal"
    >
      <Box sx={modalStyle}>
        
        {/* Header - X button removed! */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography id="document-preview-modal" variant="h6" fontWeight={700}>
            {fileName || 'Document Preview'}
          </Typography>
        </Box>

        {/* Content Preview */}
        <Box sx={{ 
          width: '100%', 
          // 🌟 INCREASED: Scaled the height up from 400px
          height: { xs: '400px', sm: '500px', md: '600px' }, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {isImage ? (
            <img 
              src={fileData} 
              alt={fileName || "Preview"} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          ) : (
            <iframe 
              src={fileData} 
              title={fileName || "PDF Preview"}
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
            />
          )}
        </Box>

        {/* Footer with Gradient Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <GradientButton onClick={onClose}>
            Close Preview
          </GradientButton>
        </Box>
        
      </Box>
    </Modal>
  );
}