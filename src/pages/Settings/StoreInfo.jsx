import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    InputLabel,
    MenuItem,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Radio,
    RadioGroup
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';
import { convertToBase64 } from '../../utils/fileHelpers';
import { getStoreInfoAPI, updateStoreInfoAPI } from '../../features/settings/settings.service';

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

import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function StoreInfo() {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [logo, setLogo] = useState(null);
    const [logoError, setLogoError] = useState("");

    const [allCategories, setAllCategories] = useState([]); 
    
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [savedData, setSavedData] = useState({
        storeName: "",
        email: "",
        description: "",
        phone: "",
        categories: [],
        logo: null,
        shippingPreference: "platform",
        selfShippingRate: 0
    });

    const [form, setForm] = useState({ ...savedData });
    const [errors, setErrors] = useState({});

    // ✅ Fetch categories safely
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/v1/categories');
                const data = await res.json();
                const categoriesArray = Array.isArray(data) ? data : data?.data || [];
                setAllCategories(categoriesArray);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setAllCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // ✅ Fetch store info safely
    useEffect(() => {
        const fetchRealData = async () => {
            try {
                const response = await getStoreInfoAPI();
                if (response.success) {
                    const dbData = response.data;
                    const formattedData = {
                        storeName: dbData.storeName || "",
                        email: dbData.email || "",
                        description: dbData.description || "",
                        phone: dbData.phone || "",
                        categories: Array.isArray(dbData.categories) ? dbData.categories : [],
                        shippingPreference: dbData.shippingPreference || "platform",
                        selfShippingRate: dbData.selfShippingRate || 0
                    };
                    setSavedData({ ...formattedData, logo: dbData.logo });
                    setForm(formattedData);
                    setSelectedCategories(formattedData.categories);
                    if (dbData.logo) setLogo(dbData.logo);
                }
            } catch (err) {
                console.error("Failed to load store data:", err);
            }
        };
        fetchRealData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        const updated = typeof value === 'string' ? value.split(',') : value;
        setForm({
            ...form,
            categories: updated,
        });
        setSelectedCategories(updated);
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setLogoError("Image must be less than 2MB");
            setLogo(null);
            e.target.value = "";
            return;
        }
        setLogoError("");
        try {
            const base64String = await convertToBase64(file);
            setLogo(base64String);
            setForm({ ...form, logo: base64String });
        } catch (error) {
            console.error("Error converting image:", error);
            setLogoError("Failed to process image");
        }
    };

    const validate = () => {
        let temp = {};
        if (!form.storeName) temp.storeName = "Store name is required";
        if (!form.email) temp.email = "Email is required";
        if (!form.phone) temp.phone = "Phone number is required";
        if (!form.categories || form.categories.length === 0) temp.categories = "At least one category is required";
        if (form.shippingPreference === 'self' && (form.selfShippingRate === '' || Number(form.selfShippingRate) < 0 || Number.isNaN(Number(form.selfShippingRate)))) {
            temp.selfShippingRate = "Enter a valid shipping rate";
        }
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleCancel = () => {
        setForm({ ...savedData });
        setLogo(savedData.logo || null);
        setSelectedCategories(savedData.categories || []);
        setErrors({});
        setIsEditing(false);
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            const payload = { ...form, selfShippingRate: Number(form.selfShippingRate) || 0 };
            const response = await updateStoreInfoAPI(payload);
            if (response.data) {
                setSavedData({ ...payload, logo });
                setIsEditing(false);
                dispatch(showToast({ message: "Store info saved successfully!", severity: "success" }));
            }
        } catch (err) {
            console.error("Save failed:", err);
            dispatch(showToast({ message: err.response?.data?.message || "Something went wrong.", severity: "error" }));
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
                        Store Information
                    </Typography>
                    {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <StyledInputLabel>Store Name</StyledInputLabel>
                        <TextField
                            fullWidth
                            name="storeName"
                            value={form.storeName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            sx={getCustomInputStyles(isEditing)}
                            error={!!errors.storeName}
                            helperText={errors.storeName}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <StyledInputLabel>Store Email</StyledInputLabel>
                        <TextField
                            fullWidth
                            name="email"
                            value={form.email}
                            disabled
                            sx={getCustomInputStyles(false)}
                      
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledInputLabel>Store Description</StyledInputLabel>
                        <TextField
                            fullWidth
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            disabled={!isEditing}
                            sx={getCustomInputStyles(isEditing)}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <StyledInputLabel>Phone Number</StyledInputLabel>
                        <TextField
                            fullWidth
                            name="phone"
                            value={form.phone}
                            disabled
                            sx={getCustomInputStyles(false)}
                           
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <StyledInputLabel>Categories</StyledInputLabel>
                        {isEditing ? (
                            <Select
                                multiple
                                fullWidth
                                size="small"
                                value={form.categories || []}
                                onChange={handleCategoryChange}
                                input={<OutlinedInput sx={getCustomInputStyles(isEditing)} />}
                                renderValue={(selected) => (selected || []).join(', ')}
                            >
                                {(Array.isArray(allCategories) ? allCategories : []).map((cat) => (
                                    <MenuItem key={cat.id} value={cat.name}>
                                        <Checkbox checked={(form.categories || []).indexOf(cat.name) > -1} />
                                        <ListItemText primary={cat.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        ) : (
                            <TextField
                                fullWidth
                                disabled
                                value={(form.categories || []).join(', ')}
                                sx={getCustomInputStyles(false)}
                            />
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <StyledInputLabel>Store Logo</StyledInputLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 64, height: 64,
                                bgcolor: 'action.hover',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {logo ? (
                                    <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <StoreIcon sx={{ color: 'text.secondary' }} />
                                ) }
                            </Box>
                            {isEditing && (
                                <>
                                    <input type="file" accept="image/*" id="logoUpload" hidden onChange={handleLogoChange} />
                                    <Button component="label" htmlFor="logoUpload">Upload</Button>
                                </>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <StyledInputLabel>Shipping Preference</StyledInputLabel>
                        <Card sx={{ borderRadius: '12px', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <RadioGroup
                                    name="shippingPreference"
                                    value={form.shippingPreference || "platform"}
                                    onChange={handleChange}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                        <Radio
                                            value="platform"
                                            disabled={!isEditing}
                                            sx={{ mt: -0.5, color: '#d1d5db', '&.Mui-checked': { color: '#ca8a04' } }}
                                        />
                                        <Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                                Platform Logistics (Recommended)
                                            </Typography>
                                            <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                                                Let us handle shipping with pre-negotiated rates and better tracking
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <Radio
                                            value="self"
                                            disabled={!isEditing}
                                            sx={{ mt: -0.5, color: '#d1d5db', '&.Mui-checked': { color: '#ca8a04' } }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                                Self Shipping
                                            </Typography>
                                            <Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
                                                Use your own courier partners and manage shipping yourself
                                            </Typography>
                                            {form.shippingPreference === 'self' && (
                                                <Box sx={{ maxWidth: 220, mt: 1 }}>
                                                    <StyledInputLabel>Self Shipping Rate (₹)</StyledInputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        name="selfShippingRate"
                                                        value={form.selfShippingRate ?? 0}
                                                        onChange={(e) => setForm({ ...form, selfShippingRate: e.target.value })}
                                                        disabled={!isEditing}
                                                        sx={getCustomInputStyles(isEditing)}
                                                        inputProps={{ min: 0, step: '0.01' }}
                                                        error={!!errors.selfShippingRate}
                                                        helperText={errors.selfShippingRate || 'Charged when a product has no delivery charge set'}
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {isEditing && (
                    <SaveCancelButtons onCancel={handleCancel} onSave={handleSubmit} />
                )}
            </CardContent>
        </Card>
    );
}