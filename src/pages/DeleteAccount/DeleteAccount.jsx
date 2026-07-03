import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // 👈 adjust path if needed

export default function DeleteAccount() {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await api.delete('/seller/delete-account');

      localStorage.clear();
      alert('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Failed to delete account');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Delete Account
          </Typography>

          <Typography color="error" sx={{ mb: 3 }}>
            Are you sure you want to delete your account?
            This action cannot be undone.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/settings')}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete Permanently
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}