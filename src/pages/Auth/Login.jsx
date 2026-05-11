import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, Link, Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useDispatch, useSelector } from 'react-redux';
import { loginSeller, clearError } from '../../features/auth/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (field) => (e) => {
    dispatch(clearError());
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginSeller(form));
    if (loginSeller.fulfilled.match(result)) navigate('/dashboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <StorefrontIcon sx={{ fontSize: 48, color: '#0FB9B1' }} />
          <Typography variant="h5" fontWeight={800}>Seller Portal</Typography>
          <Typography color="text.secondary" variant="body2">Sign in to manage your store</Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                fullWidth required
                sx={{ mb: 2 }}
                autoFocus
              />
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                fullWidth required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)} edge="end">
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                  color: '#000',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                    opacity: 0.9,
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" align="center" color="text.secondary">
              New seller?{' '}
              <Link component={RouterLink} to="/register" fontWeight={600} sx={{ color: '#0B8457' }}>
                Create an account
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
