import { useState } from 'react';
import { Container, Grid, Card, CardContent, Box, Typography, TextField, Button, Avatar, Alert, IconButton, Tooltip } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
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
  const [form, setForm] = useState({ name: user?.name || '' });
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      await api.post('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(fetchMe());
      dispatch(showToast({ message: 'Avatar updated!', severity: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>My Profile</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', py: 3 }}>
            <CardContent>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
                <Avatar src={user?.avatar} sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)',
                  color: '#fff',
                  fontSize: 36, 
                  fontWeight: 700
                }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Tooltip title="Change avatar">
                  <IconButton component="label" size="small"
                    sx={{ position: 'absolute', bottom: 0, right: 0, background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)', color: '#fff', '&:hover': { opacity: 0.9 } }}>
                    <CameraAltIcon fontSize="small" />
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Seller ID: {user?.seller_id || `S${String(user?.id).padStart(5, '0')}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user?.email}</Typography>
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
                <TextField label="Email" value={user?.email || ''} disabled fullWidth sx={{ mb: 2 }}  />
                <TextField label="Phone" value={user?.phone || ''} disabled fullWidth sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" disabled={saving} sx={gradientButtonStyle}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
