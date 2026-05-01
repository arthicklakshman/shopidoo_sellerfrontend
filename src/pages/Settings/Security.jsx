import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputLabel,
  Divider,
  Switch
} from '@mui/material';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';
import { validateSecurity } from '../../utils/validation';
import { updateSecurityAPI } from "../../features/settings/settings.service";

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

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function Security() {
  const [isEditing, setIsEditing] = useState(false);

  // We mainly use savedData to remember the 2FA state if they cancel
  const [savedData, setSavedData] = useState({
    twoFactor: false
  });

  const [form, setForm] = useState({
    currentPassword: "",
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
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactor: savedData.twoFactor
    });

    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    console.log("🔥 Submit clicked");

    const isPasswordChange = form.currentPassword || form.newPassword || form.confirmPassword;

    // ✅ Only validate when password is being changed
    if (isPasswordChange) {
      const temp = validateSecurity(form);
      console.log("🚨 Validation result:", temp);

      if (Object.keys(temp).length > 0) {
        setErrors(temp);
        return;
      }
    }

    try {
      const payload = {};

      if (isPasswordChange) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      payload.twoFactor = form.twoFactor;

      console.log("🚀 Sending payload:", payload); // 👈 Moved this AFTER payload is created

      const response = await updateSecurityAPI(payload);

      console.log("✅ API Response:", response);

      if (response.success) {
        setSavedData({ twoFactor: form.twoFactor });

        setForm({
          currentPassword: "",
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
          <StyledInputLabel>Current Password</StyledInputLabel>
          <TextField
            fullWidth
            name="currentPassword"
            type="password"
            value={isEditing ? form.currentPassword : "********"}
            onChange={handleChange}
            disabled={!isEditing}
            // Add a placeholder to tell them to type it!
            placeholder={isEditing ? "Type your current password to verify" : ""}
            variant="outlined"
            size="small"
            sx={getCustomInputStyles(isEditing)}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
          />
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
    </Card>
  );
}
