import { useState } from 'react';
import { Container, Grid, Card, CardContent, Box, Typography, TextField, Button, Avatar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import api from '../../services/api';

const gradientButtonStyle = {
  height: 40,
  px: 2,
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: 13,
  fontWeight: 600,
  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
  color: '#000',
  boxShadow: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
    color: '#000',
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
    color: 'rgba(0, 0, 0, 0.38)',
    opacity: 0.7
  }
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/profile', form);
      dispatch(fetchMe());
      dispatch(showToast({ message: 'Profile updated!', severity: 'success' }));
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      dispatch(showToast({ message: 'Password changed!', severity: 'success' }));
    } catch (err) { dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })); }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Profile</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)',
                color: '#000',
                fontSize: 28, 
                mb: 1.5,
                fontWeight: 700
              }}>
                {user?.name?.[0]}
              </Avatar>
              <Typography fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              <Typography variant="caption" sx={{ color: '#0FB9B1', fontWeight: 700 }}>Seller Account</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Edit Profile</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleProfileSave}>
                <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                <TextField label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" disabled={saving} sx={gradientButtonStyle}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
              <Box component="form" onSubmit={handlePasswordChange}>
                <TextField label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                <TextField label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} fullWidth sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" sx={gradientButtonStyle}>Update Password</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
