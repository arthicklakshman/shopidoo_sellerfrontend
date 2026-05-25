import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputLabel,
  useTheme,
  alpha
} from '@mui/material';

// ✅ Custom Helper Imports 
import { getBankDetailsAPI, updateBankDetailsAPI } from '../../features/settings/settings.service';
import { findBankName } from '../../utils/bankHelpers';
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';

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
export default function BankDetails() {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const [savedData, setSavedData] = useState({
    accountName: "",
    accountNumber: "",
    routingNumber: "", 
    swiftCode: ""
  });

  const [form, setForm] = useState({ ...savedData });
  const [errors, setErrors] = useState({});

  const displayedBankName = findBankName(form.routingNumber);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await getBankDetailsAPI();
        if (response.success) {
          const dbData = {
            accountName: response.data.accountName || "",
            accountNumber: response.data.accountNumber || "",
            routingNumber: response.data.routingNumber || "", 
            swiftCode: "" 
          };
          setSavedData(dbData);
          setForm(dbData);
        }
      } catch (err) {
        console.error("Failed to load bank details", err);
      }
    };
    fetchBankDetails();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let temp = {};
    if (!form.accountName) temp.accountName = "Account holder name is required";
    if (!form.accountNumber) temp.accountNumber = "Account number is required";
    if (!form.routingNumber) temp.routingNumber = "IFSC code is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleCancel = () => {
    setForm({ ...savedData }); 
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const response = await updateBankDetailsAPI(form);
      if (response.success) {
        setSavedData({ ...form });
        setIsEditing(false);
        alert("Bank details updated successfully");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong.");
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
            Bank Account Details
          </Typography>
          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
        </Box>

        {/* Info Banner */}
        <Box sx={{
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          border: 1,
          borderColor: alpha(theme.palette.info.main, 0.3),
          borderRadius: '8px',
          px: 2,
          py: 1.5,
          mb: 4
        }}>
          <Typography sx={{ color: theme.palette.info.main, fontSize: '14px', fontWeight: 500 }}>
            These details will be used for receiving payments from your sales.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledInputLabel>Account Holder Name</StyledInputLabel>
            <TextField
              fullWidth
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter account holder name"
              variant="outlined"
              size="small"
              sx={getCustomInputStyles(isEditing)}
              error={!!errors.accountName}
              helperText={errors.accountName}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledInputLabel>Bank Name</StyledInputLabel>
            <TextField
              fullWidth
              name="bankName"
              value={displayedBankName}
              disabled={true}           
              placeholder="Bank will be detected from IFSC"
              variant="outlined"
              size="small"
              sx={getCustomInputStyles(false)} 
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledInputLabel>Account Number</StyledInputLabel>
            <TextField
              fullWidth
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter account number"
              type="password"
              variant="outlined"
              size="small"
              sx={getCustomInputStyles(isEditing)}
              error={!!errors.accountNumber}
              helperText={errors.accountNumber}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StyledInputLabel>IFSC Code</StyledInputLabel>
            <TextField
              fullWidth
              name="routingNumber"
              value={form.routingNumber}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. SBIN0001234"
              variant="outlined"
              size="small"
              sx={getCustomInputStyles(isEditing)}
              error={!!errors.routingNumber}
              helperText={errors.routingNumber}
            />
          </Grid>

          <Grid item xs={12} >
            <StyledInputLabel>SWIFT/BIC Code (for international)</StyledInputLabel>
            <TextField
              fullWidth
              name="swiftCode"
              value={form.swiftCode}
              onChange={handleChange}
              disabled={true} 
              placeholder="Enter SWIFT/BIC code"
              variant="outlined"
              size="small"
              sx={getCustomInputStyles(false)}
            />
          </Grid>
        </Grid>

        {isEditing && (
            <SaveCancelButtons 
               onCancel={handleCancel} 
               onSave={handleSubmit} 
               saveText="Update Bank Details" 
            />
        )}
      </CardContent>
    </Card>
  );
}
