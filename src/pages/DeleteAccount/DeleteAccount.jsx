import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await api.delete('/user/delete-account');
      localStorage.clear();
      alert('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      // Backend returns { success: false, message: "..." } for 400 errors
      const msg =
        error.response?.data?.message ||
        'Failed to delete account. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Delete Account
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}

          <Typography color="error" sx={{ mb: 3 }}>
            Are you sure you want to delete your account?
            This action cannot be undone.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/settings')} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
              {loading ? 'Processing...' : 'Delete Permanently'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}