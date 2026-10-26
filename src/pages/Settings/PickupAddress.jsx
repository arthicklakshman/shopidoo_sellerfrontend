import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputLabel, Autocomplete
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import api from '../../services/api';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';
import { getPickupAddressAPI, updatePickupAddressAPI } from '../../features/settings/settings.service';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const StyledInputLabel = ({ children, required }) => (
  <InputLabel sx={{ color: 'text.primary', fontSize: '14px', mb: 1, fontWeight: 600 }}>
    {children}
    {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
  </InputLabel>
);

const getCustomInputStyles = (isEditing) => ({
  backgroundColor: 'action.hover',
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': { border: isEditing ? '1px solid' : 'none', borderColor: 'divider' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: isEditing ? '1px solid' : 'none', borderColor: 'primary.main' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: isEditing ? '1px solid' : 'none', borderColor: 'primary.main' },
  '& .MuiOutlinedInput-input': { padding: '10px 14px', fontSize: '14px', color: 'text.primary', WebkitTextFillColor: (theme) => theme.palette.text.primary },
  '& .Mui-disabled': { WebkitTextFillColor: (theme) => theme.palette.text.primary }
});

export default function PickupAddress() {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);

  const [savedData, setSavedData] = useState({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "India" 
  });

  const [form, setForm] = useState({ ...savedData });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await getPickupAddressAPI();
        if (response.success && response.data) {
          const dbData = {
            address1: response.data.addressLine1 || response.data.pickupAddress || "",
            address2: response.data.addressLine2 || "",
            city: response.data.city || "",
            state: response.data.state || "",
            zip: response.data.pincode || "", 
            country: "India" 
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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    // Auto-resolve City and State when a 6-digit PIN code is entered
    if (name === 'zip' && /^\d{6}$/.test(value.trim())) {
      setIsLookingUpPincode(true);
      try {
        const res = await api.get(`/pincodes/validate?pincode=${value.trim()}`);
        if (res.data?.success && res.data.data?.isValid) {
          const resolvedState = res.data.data.state || '';
          const resolvedDistrict = res.data.data.district || '';
          setForm((prev) => ({
            ...prev,
            state: resolvedState || prev.state,
            city: prev.city || resolvedDistrict,
          }));
          if (resolvedState) {
            setErrors((prev) => ({ ...prev, state: null, zip: null }));
          }
        }
      } catch (err) {
        // Pincode lookup error is non-fatal; user can still select manually
      } finally {
        setIsLookingUpPincode(false);
      }
    }
  };

  const validate = () => {
    let temp = {};
    if (!form.address1?.trim()) temp.address1 = "Address Line 1 is required";
    if (!form.city?.trim()) temp.city = "City is required";
    if (!form.state?.trim()) temp.state = "State is required";
    if (!form.zip?.trim()) {
      temp.zip = "PIN code is required";
    } else if (!/^\d{6}$/.test(form.zip.trim())) {
      temp.zip = "Please enter a valid 6-digit PIN code";
    }
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
        dispatch(showToast({ message: "Pickup address updated successfully", severity: "success" }));
      }
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: err.response?.data?.message || "Failed to update pickup address", severity: "error" }));
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Pickup Address</Typography>
            <Typography variant="body2" color="text.secondary">
              Orders and intra-state delivery eligibility for GST Enrollment ID sellers are based on this pickup location.
            </Typography>
          </Box>
          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledInputLabel required={isEditing}>Address Line 1</StyledInputLabel>
            <TextField fullWidth name="address1" value={form.address1} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.address1} helperText={errors.address1} />
          </Grid>
          <Grid item xs={12}>
            <StyledInputLabel>Address Line 2</StyledInputLabel>
            <TextField fullWidth name="address2" value={form.address2} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.address2} helperText={errors.address2} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledInputLabel required={isEditing}>City</StyledInputLabel>
            <TextField fullWidth name="city" value={form.city} onChange={handleChange} disabled={!isEditing} variant="outlined" size="small" sx={getCustomInputStyles(isEditing)} error={!!errors.city} helperText={errors.city} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledInputLabel required={isEditing}>State</StyledInputLabel>
            {isEditing ? (
              <Autocomplete
                options={INDIAN_STATES}
                value={form.state || null}
                onChange={(_, newValue) => {
                  setForm((prev) => ({ ...prev, state: newValue || '' }));
                  if (errors.state) setErrors((prev) => ({ ...prev, state: null }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select State"
                    variant="outlined"
                    size="small"
                    error={!!errors.state}
                    helperText={errors.state}
                    sx={getCustomInputStyles(true)}
                  />
                )}
              />
            ) : (
              <TextField fullWidth name="state" value={form.state} disabled variant="outlined" size="small" sx={getCustomInputStyles(false)} />
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledInputLabel required={isEditing}>PIN Code</StyledInputLabel>
            <TextField 
              fullWidth 
              name="zip" 
              value={form.zip} 
              onChange={handleChange} 
              disabled={!isEditing} 
              variant="outlined" 
              size="small" 
              inputProps={{ maxLength: 6 }}
              placeholder={isLookingUpPincode ? 'Checking...' : '6-digit PIN'}
              sx={getCustomInputStyles(isEditing)} 
              error={!!errors.zip} 
              helperText={errors.zip || (isLookingUpPincode ? 'Resolving location...' : '')} 
            />
          </Grid>
          <Grid item xs={12}>
            <StyledInputLabel>Country</StyledInputLabel>
            <TextField 
              fullWidth 
              name="country" 
              value={form.country} 
              disabled={true} 
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
