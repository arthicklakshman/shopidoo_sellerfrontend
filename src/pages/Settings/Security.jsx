import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputLabel,
  Divider,
  Switch,
  InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSelector } from 'react-redux';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';
import { validateSecurity } from '../../utils/validation';
import { updateSecurityAPI } from "../../features/settings/settings.service";

// ✅ OTP Imports
import { useOtp } from '../../utils/useOtp';
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
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
    fontSize: '14px',
    color: '#111827',
    WebkitTextFillColor: '#111827',
  },
  '& .Mui-disabled': {
    WebkitTextFillColor: '#111827',
  }
});

const VerifyButton = ({ onClick, isVerified }) => (
  <GradientButton
    type="button"
    onClick={onClick}
    disabled={isVerified}
    sx={{
      py: 0.6, px: 3, borderRadius: '6px', textTransform: 'none', fontSize: '0.875rem', minWidth: 'auto',
      background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
      boxShadow: 'none',
      ...(isVerified && {
        background: '#ecfdf5', color: '#059669', boxShadow: 'none',
        '&:hover': { background: '#ecfdf5', boxShadow: 'none' },
        '&.Mui-disabled': { background: '#ecfdf5', color: '#059669', WebkitTextFillColor: '#059669' } 
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
  const { user } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  // OTP Hook
  const { 
    otpModal, otpLoading, otpError, isMobileVerified, isEmailVerified,
    sendOtp, verifyOtp, resendOtp, closeOtpModal 
  } = useOtp();

  // We mainly use savedData to remember the 2FA state if they cancel
  const [savedData, setSavedData] = useState({
    twoFactor: false
  });

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
    twoFactor: savedData.twoFactor
  });

  const [errors, setErrors] = useState({});

  // ---------------- HANDLERS ----------------

  const handleChange = (e) => {
    if (!isEditing) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setForm({ ...form, twoFactor: e.target.checked });
  };

  const handleCancel = () => {
    setForm({
      newPassword: "",
      confirmPassword: "",
      twoFactor: savedData.twoFactor
    });

    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const isPasswordChange = form.newPassword || form.confirmPassword;

    // ✅ Only validate when password is being changed
    if (isPasswordChange) {
      const temp = validateSecurity(form);

      if (Object.keys(temp).length > 0) {
        setErrors(temp);
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
        alert("✅ Security updated successfully");
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleVerifyClick = async (type, target) => {
    if (!target) return alert(`No ${type} found for verification.`);
    try {
      await sendOtp(type, target);
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.125rem' }}>
            Password & Security
          </Typography>

          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
        </Box>

        <Box>
          <StyledInputLabel>New Password</StyledInputLabel>
          <TextField
            fullWidth
            name="newPassword"
            type="password"
            value={isEditing && !form.newPassword ? "" : (isEditing ? form.newPassword : "")}
            onChange={handleChange}
            disabled={!isEditing}
            variant="outlined"
            size="small"
            sx={getCustomInputStyles(isEditing)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />

          <StyledInputLabel>Confirm New Password</StyledInputLabel>
          <TextField
            fullWidth
            name="confirmPassword"
            type="password"
            value={isEditing && !form.confirmPassword ? "" : (isEditing ? form.confirmPassword : "")}
            onChange={handleChange}
            disabled={!isEditing}
            variant="outlined"
            size="small"
            sx={{ ...getCustomInputStyles(isEditing), mb: 0 }}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

        {/* --- CONTACT VERIFICATION SECTION --- */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Contact Verification
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
                />
              </InputAdornment> 
            )}} 
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

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
        </Box>

        {isEditing && (
            <SaveCancelButtons onCancel={handleCancel} onSave={handleSubmit} saveText="Update Password" />
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
