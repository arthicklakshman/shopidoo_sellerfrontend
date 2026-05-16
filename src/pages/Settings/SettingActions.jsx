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
            color: '#4CAF50',
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
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '8px',
                px: 3,
                fontWeight: 500,
                '&:hover': {
                    backgroundColor: '#43a047' // Slightly darker green on hover
                }
            }}
        >
            {saveText}
        </Button>

    </Box>
);