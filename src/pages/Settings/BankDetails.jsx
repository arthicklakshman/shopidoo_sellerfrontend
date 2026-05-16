import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputLabel
} from '@mui/material';

// ✅ Custom Helper Imports 
import { getBankDetailsAPI, updateBankDetailsAPI } from '../../features/settings/settings.service';
import { findBankName } from '../../utils/bankHelpers';
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';

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
export default function BankDetails() {

  const [isEditing, setIsEditing] = useState(false);

  // Keeps track of the real data so we can revert if the user clicks "Cancel"
  const [savedData, setSavedData] = useState({
    accountName: "",
    accountNumber: "",
    routingNumber: "", // This stores the IFSC Code
    swiftCode: ""
  });

  const [form, setForm] = useState({ ...savedData });
  const [errors, setErrors] = useState({});

  // 🔥 Automatically derive the Bank Name from the IFSC (routingNumber)
  const displayedBankName = findBankName(form.routingNumber);

  // ---------------- API INTEGRATION ----------------
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await getBankDetailsAPI();
        if (response.success) {
          const dbData = {
            accountName: response.data.accountName || "",
            accountNumber: response.data.accountNumber || "",
            routingNumber: response.data.routingNumber || "", // Mapped from ifscCode in backend
            swiftCode: "" // Disabled for now
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

  // ---------------- HANDLERS ----------------

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let temp = {};

    if (!form.accountName) temp.accountName = "Account holder name is required";
    if (!form.accountNumber) temp.accountNumber = "Account number is required";
    if (!form.routingNumber) temp.routingNumber = "IFSC code is required";
    // bankName is auto-generated and swiftCode is disabled, so we skip validating them

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleCancel = () => {
    setForm({ ...savedData }); // Revert to original data
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // Send data to backend
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
            Bank Account Details
          </Typography>

          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
        </Box>

        {/* Info Banner */}
        <Box sx={{
          backgroundColor: '#f0f7ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          px: 2,
          py: 1.5,
          mb: 4
        }}>
          <Typography sx={{ color: '#1e40af', fontSize: '14px' }}>
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
              value={displayedBankName} // 🔥 Populated automatically from the utility
              disabled={true}           // 🔥 Always disabled since it's automatic
              placeholder="Bank will be detected from IFSC"
              variant="outlined"
              size="small"
              sx={getCustomInputStyles(false)} // 🔥 Keep the disabled styling
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
