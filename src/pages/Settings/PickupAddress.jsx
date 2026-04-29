


import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputLabel
} from '@mui/material';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingsActions';
import { getPickupAddressAPI, updatePickupAddressAPI } from '../../features/settings/settings.service';

const StyledInputLabel = ({ children }) => (
  <InputLabel sx={{ color: '#111827', fontSize: '14px', mb: 1, fontWeight: 400 }}>{children}</InputLabel>
);

const getCustomInputStyles = (isEditing) => ({
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: isEditing ? '1px solid #3b82f6' : 'none' },
  '& .MuiOutlinedInput-input': { padding: '10px 14px', fontSize: '14px', color: '#111827', WebkitTextFillColor: '#111827' },
  '& .Mui-disabled': { WebkitTextFillColor: '#111827' }
});

export default function PickupAddress() {
  const [isEditing, setIsEditing] = useState(false);

  const [savedData, setSavedData] = useState({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "India" // 🔥 Default set to India
  });

  const [form, setForm] = useState({ ...savedData });
  const [errors, setErrors] = useState({});

  // ---------------- API INTEGRATION ----------------
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await getPickupAddressAPI();
        if (response.success && response.data) {
          const dbData = {
            // 🔥 Map DB keys to Frontend keys
            address1: response.data.addressLine1 || "",
            address2: response.data.addressLine2 || "",
            city: response.data.city || "",
            state: response.data.state || "",
            zip: response.data.pincode || "", // mapped pincode -> zip
            country: "India" // Force Country to India
          };
          setSavedData(dbData);
          setForm(dbData);
        }
      } catch (err) {
        console.error("Failed to load pickup address", err);
      }
    };
    fetchAddress();
  }, []);

  // ---------------- HANDLERS ----------------

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let temp = {};
    if (!form.address1) temp.address1 = "Address Line 1 is required";
    if (!form.city) temp.city = "City is required";
    if (!form.state) temp.state = "State is required";
    if (!form.zip) temp.zip = "ZIP Code is required";
    if (!form.country) temp.country = "Country is required";

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
      const response = await updatePickupAddressAPI(form);
      if (response.success) {
        setSavedData({ ...form });
        setIsEditing(false);
        alert("Pickup address updated successfully");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // ---------------- UI ----------------

  return (
    <Card sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '1000px', fontFamily: 'sans-serif' }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>Pickup Address</Typography>
          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledInputLabel>Address Line 1</StyledInputLabel>
            <TextField fullWidth name="address1" value={form.address1} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.address1} helperText={errors.address1} />
          </Grid>
          <Grid item xs={12}>
            <StyledInputLabel>Address Line 2</StyledInputLabel>
            <TextField fullWidth name="address2" value={form.address2} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.address2} helperText={errors.address2} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledInputLabel>City</StyledInputLabel>
            <TextField fullWidth name="city" value={form.city} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.city} helperText={errors.city} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledInputLabel>State</StyledInputLabel>
            <TextField fullWidth name="state" value={form.state} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.state} helperText={errors.state} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledInputLabel>ZIP Code</StyledInputLabel>
            <TextField fullWidth name="zip" value={form.zip} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.zip} helperText={errors.zip} />
          </Grid>
          <Grid item xs={12}>
            <StyledInputLabel>Country</StyledInputLabel>
            <TextField 
              fullWidth 
              name="country" 
              value={form.country} 
              onChange={handleChange} 
              disabled={true} // 🔥 Disabled to strictly enforce "India"
              variant="outlined" 
              size="small" 
              sx={getCustomInputStyles(false)} 
            />
          </Grid>
        </Grid>

        {isEditing && (
            <SaveCancelButtons onCancel={handleCancel} onSave={handleSubmit} saveText="Update Address" />
        )}
      </CardContent>
    </Card>
  );
}