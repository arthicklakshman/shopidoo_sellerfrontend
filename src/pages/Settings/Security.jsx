import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputLabel,
  Divider,
  Switch,
  InputAdornment,
  IconButton
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import { useSelector } from 'react-redux';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';
import { validateSecurity } from '../../utils/validation';
import { updateSecurityAPI } from "../../features/settings/settings.service";
import api from '../../services/api';

// ✅ OTP Imports
import { useOtp } from '../../hooks/useOtp';
import OtpModal from '../../components/shared/OtpModal/OtpModal';
import GradientButton from '../../components/shared/GradientButton/GradientButton';

// ----------------------------------------------------------------------
// Styled Components
// ----------------------------------------------------------------------
const StyledInputLabel = ({ children }) => (
  <InputLabel sx={{ color: '#111827', fontSize: '14px', mb: 1, fontWeight: 400 }}>
    {children}
  </InputLabel>
);

const getCustomInputStyles = (isEditing) => ({
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  mb: 3,
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: isEditing ? '1px solid #3b82f6' : 'none',
  },
  
  // Standard text color for editable state
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
    fontSize: '14px',
    color: '#111827',
  },
  
  // 🌟 FIX: Force disabled text to be grey consistently across all fields
  '& .MuiOutlinedInput-input.Mui-disabled': {
    WebkitTextFillColor: '#9ca3af', // Soft grey matching the email
    color: '#9ca3af',
  },
  
  // Hides native browser eye icons
  '& .MuiOutlinedInput-input::-ms-reveal': { display: 'none' },
  '& .MuiOutlinedInput-input::-ms-clear': { display: 'none' }
});
const VerifyButton = ({ onClick, isVerified, disabled }) => (
  <GradientButton
    type="button"
    onClick={onClick}
    disabled={isVerified || disabled} // 🌟 Disables if verified OR locked
    sx={{
      py: 0.6, px: 3, borderRadius: '6px', textTransform: 'none', fontSize: '0.875rem', minWidth: 'auto',
      background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
      boxShadow: 'none',
      ...(isVerified ? {
        // Style when Successfully Verified
        background: '#ecfdf5', color: '#059669', boxShadow: 'none',
        '&:hover': { background: '#ecfdf5', boxShadow: 'none' },
        '&.Mui-disabled': { background: '#ecfdf5', color: '#059669', WebkitTextFillColor: '#059669' } 
      } : {
        // 🌟 Style when Locked (!isEditing)
        '&.Mui-disabled': { background: '#e5e7eb', color: '#9ca3af', WebkitTextFillColor: '#9ca3af' }
      })
    }}
  >
    {isVerified ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckCircleIcon sx={{ fontSize: 16 }} /> Verified
      </Box>
    ) : 'Verify'}
  </GradientButton>
);
// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function Security() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  // Toggle View Icons State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Hook
  const { 
    otpModal, otpLoading, otpError, isMobileVerified, isEmailVerified,
    sendOtp, verifyOtp, resendOtp, closeOtpModal 
  } = useOtp();

  // We mainly use savedData to remember the 2FA state if they cancel
  const [savedData, setSavedData] = useState({
    twoFactor: user?.twoFactor || false
  });

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
    twoFactor: user?.twoFactor || false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setSavedData({
        twoFactor: user.twoFactor || false
      });
      setForm(prev => ({
        ...prev,
        twoFactor: user.twoFactor || false
      }));
    }
  }, [user]);

  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get('/payout-requests/wallet');
        setWalletBalance(Number(res.data?.data?.balance ?? 0));
      } catch (err) {
        console.error("Failed to fetch wallet", err);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchWallet();
  }, []);

  // ---------------- HANDLERS ----------------

  const handleChange = (e) => {
    if (!isEditing) return;
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear errors as user types
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleToggle = () => {
    setForm(prev => ({
      ...prev,
      twoFactor: !prev.twoFactor
    }));
  };

  const handleCancel = () => {
    setForm({
      newPassword: "",
      confirmPassword: "",
      twoFactor: savedData.twoFactor
    });

    setErrors({});
    setIsEditing(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 🌟 FIX 3 & 4: Strict validation of both Password and OTPs before API call
  const handleSubmit = async () => {
    const isPasswordChange = form.newPassword || form.confirmPassword;

    if (isPasswordChange) {
      const validationErrors = validateSecurity(form);

      // If the utils validation finds an error (like too short, or mismatch)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Final safety net: Prevent bypass if they somehow opened the fields without verifying
      if (!isEmailVerified || !isMobileVerified) {
        alert("Authentication Error: Both Email and Mobile must be verified via OTP.");
        return; 
      }
    }

    try {
      const payload = {};

      if (isPasswordChange) {
        payload.newPassword = form.newPassword;
        payload.email = user.email || user.emailId; // Send email for reset
      }

      payload.twoFactor = form.twoFactor;

      const response = await updateSecurityAPI(payload);

      if (response.success) {
        setSavedData({ twoFactor: form.twoFactor });

        setForm({
          newPassword: "",
          confirmPassword: "",
          twoFactor: form.twoFactor
        });

        setIsEditing(false);
        alert(isPasswordChange ? "✅ Password updated successfully" : "✅ Security settings updated successfully");
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleVerifyClick = async (type, target) => {
    if (!target) return alert(`No ${type} found for verification.`);
    try {
      await sendOtp(type, target, 'forgot_password');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to send OTP.');
    }
  };

  // ---------------- UI ----------------

  return (
    <Card sx={{ 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      maxWidth: '1000px',
      fontFamily: 'sans-serif'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.125rem' }}>
            Password & Security
          </Typography>

          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
        </Box>

        {/* --- 🌟 FIX 2: CONTACT VERIFICATION SECTION MOVED TO TOP --- */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Identity Verification
          </Typography>

        <StyledInputLabel>Registered Email</StyledInputLabel>
          <TextField
            fullWidth
            value={user?.email || user?.emailId || ''}
            disabled
            variant="outlined"
            size="small"
            sx={getCustomInputStyles(false)}
            InputProps={{ endAdornment: ( 
              <InputAdornment position="end">
                <VerifyButton 
                  onClick={() => handleVerifyClick('email', user?.email || user?.emailId)} 
                  isVerified={isEmailVerified} 
                  disabled={!isEditing} // 🌟 FIX: Locked until "Edit" is clicked
                />
              </InputAdornment> 
            )}} 
          />

          <StyledInputLabel>Registered Mobile Number</StyledInputLabel>
          <TextField
            fullWidth
            value={user?.mobileNumber || user?.phone || ''}
            disabled
            variant="outlined"
            size="small"
            sx={{ ...getCustomInputStyles(false), mb: 0 }}
            InputProps={{ endAdornment: ( 
              <InputAdornment position="end">
                <VerifyButton 
                  onClick={() => handleVerifyClick('mobile', user?.mobileNumber || user?.phone)} 
                  isVerified={isMobileVerified} 
                  disabled={!isEditing} // 🌟 FIX: Locked until "Edit" is clicked
                />
              </InputAdornment> 
            )}} 
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

        {/* --- 🌟 FIX 2: PASSWORD SECTION (Conditionally Rendered) --- */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Change Password
          </Typography>

          {!isEditing ? (
            /* Locked/Read-Only State */
            <Box>
              <StyledInputLabel>New Password</StyledInputLabel>
              <TextField fullWidth type="password" value="" disabled size="small" sx={getCustomInputStyles(false)} />
              <StyledInputLabel>Confirm New Password</StyledInputLabel>
              <TextField fullWidth type="password" value="" disabled size="small" sx={{ ...getCustomInputStyles(false), mb: 0 }} />
            </Box>
          ) : (isEmailVerified && isMobileVerified) ? (
            /* Unlocked State (Ready to type) */
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#0B8457', fontWeight: 700, mb: 3 }}>
                Identity verified! You may now enter a new password.
              </Typography>
              
              <StyledInputLabel>New Password</StyledInputLabel>
              <TextField
                fullWidth
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange}
                variant="outlined"
                size="small"
                sx={getCustomInputStyles(true)}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                InputProps={{ endAdornment: ( 
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }}> 
                      {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} 
                    </IconButton>
                  </InputAdornment> 
                )}}
              />

              <StyledInputLabel>Confirm New Password</StyledInputLabel>
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                variant="outlined"
                size="small"
                sx={{ ...getCustomInputStyles(true), mb: 0 }}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{ endAdornment: ( 
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }}> 
                      {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} 
                    </IconButton>
                  </InputAdornment> 
                )}}
              />
            </Box>
          ) : (
            /* Editing but NOT Verified */
            <Box sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
               <Typography variant="body2" sx={{ color: '#6b7280' }}>
                 For your security, please verify both your <strong>Email</strong> and <strong>Mobile Number</strong> above to unlock password changes.
               </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

        {/* --- TWO FACTOR SECTION --- */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Two-Factor Authentication
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ pr: 2 }}>
              <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
                Enable two-factor authentication for added security
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: '13px' }}>
                You'll need to enter a code from your phone in addition to your password
              </Typography>
            </Box>

            <Switch
              checked={form.twoFactor}
              onChange={handleToggle}
              disabled={!isEditing}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#4CAF50',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#4CAF50',
                },
              }}
            />
          </Box>
          <Box sx={{ mt: 3 }}>
            {walletBalance < 0 && (
              <Box sx={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px',
                padding: '16px 20px', marginBottom: '16px', fontSize: '0.9rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span>
                  Your wallet has a debt of <strong>₹{Math.abs(walletBalance).toLocaleString("en-IN")}</strong>. Please clear your dues before deleting your account.
                </span>
              </Box>
            )}
            <button
              onClick={() => navigate('/delete-account')}
              disabled={loadingWallet || walletBalance < 0}
              style={{
                background: (loadingWallet || walletBalance < 0) ? '#e5e7eb' : '#d32f2f',
                color: (loadingWallet || walletBalance < 0) ? '#9ca3af' : '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: (loadingWallet || walletBalance < 0) ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              Delete Account
            </button>
          </Box>
        </Box>

        {isEditing && (
          <SaveCancelButtons onCancel={handleCancel} onSave={handleSubmit} />
        )}
      </CardContent>

      {/* 🌟 OTP MODAL */}
      <OtpModal
        open={otpModal.isOpen}
        onClose={closeOtpModal}
        targetValue={otpModal.targetValue} 
        type={otpModal.type}
        onVerify={verifyOtp}
        onResend={resendOtp}
        isLoading={otpLoading}
        error={otpError}
      />
    </Card>
  );
}