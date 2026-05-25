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
  <InputLabel sx={{ color: 'text.primary', fontSize: '14px', mb: 1, fontWeight: 600 }}>
    {children}
  </InputLabel>
);

const getCustomInputStyles = (isEditing) => ({
  backgroundColor: 'action.hover',
  borderRadius: '8px',
  mb: 3,
  '& .MuiOutlinedInput-notchedOutline': { border: isEditing ? '1px solid' : 'none', borderColor: 'divider' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: isEditing ? '1px solid' : 'none', borderColor: 'primary.main' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: isEditing ? '1px solid' : 'none',
    borderColor: 'primary.main'
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
    fontSize: '14px',
    color: 'text.primary',
    WebkitTextFillColor: (theme) => theme.palette.text.primary,
  },
  '& .Mui-disabled': {
    WebkitTextFillColor: (theme) => theme.palette.text.primary,
  }
});

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function Security() {
  const [isEditing, setIsEditing] = useState(false);

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
    const isPasswordChange = form.currentPassword || form.newPassword || form.confirmPassword;
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
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      payload.twoFactor = form.twoFactor;

      const response = await updateSecurityAPI(payload);
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

  return (
    <Card sx={{ 
      borderRadius: '12px', 
      border: 1, 
      borderColor: 'divider', 
      boxShadow: 'none',
      maxWidth: '1000px',
      bgcolor: 'background.paper'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.125rem' }}>
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

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
            Two-Factor Authentication
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ pr: 2 }}>
              <Typography sx={{ color: 'text.primary', fontSize: '14px', fontWeight: 500, mb: 0.5 }}>
                Enable two-factor authentication for added security
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>
                You'll need to enter a code from your phone in addition to your password
              </Typography>
            </Box>

            <Switch
              checked={form.twoFactor}
              onChange={handleToggle}
              disabled={!isEditing}
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
