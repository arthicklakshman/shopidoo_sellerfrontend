import React from 'react';
import { Box, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

// ----------------------------------------------------------------------
// 1. Top Right Edit Button
// ----------------------------------------------------------------------
export const EditButton = ({ onClick }) => (
    <Button
        onClick={onClick}
        startIcon={<EditIcon />}
        sx={{
            color: '#0B8457',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '15px'
        }}
    >
        Edit
    </Button>
);

// ----------------------------------------------------------------------
// 2. Bottom Save & Cancel Buttons (with dynamic text)
// ----------------------------------------------------------------------
export const SaveCancelButtons = ({ onCancel, onSave, saveText = "Save Changes" }) => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5 }}>
        
        {/* Cancel Button */}
        <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
                textTransform: 'none',
                color: '#374151',
                borderColor: '#d1d5db',
                borderRadius: '8px',
                px: 3,
                fontWeight: 500
            }}
        >
            Cancel
        </Button>

        {/* Save Button */}
        <Button
            variant="contained"
            onClick={onSave}
            sx={{
                textTransform: 'none',
                background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                color: '#000',
                borderRadius: '8px',
                px: 3,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                    opacity: 0.9,
                    boxShadow: 'none'
                }
            }}
        >
            {saveText}
        </Button>

    </Box>
);