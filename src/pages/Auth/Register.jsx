import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, Link, Divider, LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useDispatch, useSelector } from 'react-redux';
import { registerSeller, clearError } from '../../features/auth/authSlice';

const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (pwd.length >= 10) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColor = ['', 'error', 'warning', 'warning', 'success', 'success'];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');

  const strength = getPasswordStrength(form.password);

  const handleChange = (field) => (e) => {
    dispatch(clearError());
    setFormError('');
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (strength < 3) {
      setFormError('Password is too weak. Use uppercase, lowercase, and a number.');
      return;
    }

    const result = await dispatch(registerSeller({
      name: form.name,
      email: form.email,
      password: form.password,
    }));
    if (registerSeller.fulfilled.match(result)) navigate('/dashboard');
  };

  const displayError = formError || error;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <StorefrontIcon color="primary" sx={{ fontSize: 48 }} />
          <Typography variant="h5" fontWeight={800}>Create Seller Account</Typography>
          <Typography color="text.secondary" variant="body2">Join Shopidoo and start selling today</Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            {displayError && <Alert severity="error" sx={{ mb: 2 }}>{displayError}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={handleChange('name')}
                fullWidth required
                sx={{ mb: 2 }}
                autoFocus
              />

              <TextField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                fullWidth required
                sx={{ mb: 2 }}
              />

              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                fullWidth required
                sx={{ mb: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)} edge="end">
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Min 6 chars with uppercase, lowercase, and a number."
              />

              {form.password.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(strength / 5) * 100}
                    color={strengthColor[strength]}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color={`${strengthColor[strength]}.main`} sx={{ mt: 0.5, display: 'block' }}>
                    {strengthLabel[strength]}
                  </Typography>
                </Box>
              )}

              <TextField
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                fullWidth required
                sx={{ mb: 3 }}
                error={form.confirmPassword.length > 0 && form.password !== form.confirmPassword}
                helperText={form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? 'Passwords do not match.' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                        {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Seller Account'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" align="center" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>
                Sign In
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Register;
