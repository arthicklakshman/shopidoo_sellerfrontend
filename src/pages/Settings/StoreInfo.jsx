

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
    Autocomplete
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';


// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingsActions';
import { convertToBase64 } from '../../utils/fileHelpers';
import { getStoreInfoAPI, updateStoreInfoAPI } from '../../features/settings/settings.service';


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
export default function StoreInfo() {

    const [isEditing, setIsEditing] = useState(false);
    const [logo, setLogo] = useState(null);
    const [logoError, setLogoError] = useState("");

    const [allCategories, setAllCategories] = useState([]); 
    
    // We can actually drop 'selectedCategories' state entirely to clean up your code,
    // since form.categories handles the truth, but we'll keep it simple and just sync them.
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [savedData, setSavedData] = useState({
        storeName: "",
        email: "",
        description: "",
        phone: "",
        categories: [],
        logo: null
    });

    const [form, setForm] = useState({ ...savedData });
    const [errors, setErrors] = useState({});

    // ✅ Fetch categories safely
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/v1/categories');
                const data = await res.json();

                console.log("API response:", data);

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
        // ✅ Corrected fetchRealData logic
const fetchRealData = async () => {
    try {
        const response = await getStoreInfoAPI();

        // If your service returns 'response.data', then 'response' here IS the backend JSON
        if (response.success) {
            const dbData = response.data; // This is the actual seller object

            const formattedData = {
                storeName: dbData.storeName || "",
                email: dbData.email || "",
                description: dbData.description || "",
                phone: dbData.phone || "",
                categories: Array.isArray(dbData.categories) ? dbData.categories : []
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

    // ---------------- HANDLERS ----------------

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (event, newValue) => {
        // newValue is already an array of strings (e.g., ["Electronics", "Clothing"])
        setForm({
            ...form,
            categories: newValue || [], 
        });

        setSelectedCategories(newValue || []);
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
        if (!form.description) temp.description = "Description is required";
        if (!form.phone) temp.phone = "Phone number is required";
        if (!form.categories || form.categories.length === 0) temp.categories = "At least one category is required";

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
            const response = await updateStoreInfoAPI(form);

            if (response.data) {
                setSavedData({ ...form, logo });
                setIsEditing(false);
                alert("Saved successfully!");
            }
        } catch (err) {
            console.error("Save failed:", err);
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
                            onChange={handleChange}
                            disabled={!isEditing}
                            sx={getCustomInputStyles(isEditing)}
                            error={!!errors.email}
                            helperText={errors.email}
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
                            onChange={handleChange}
                            disabled={!isEditing}
                            sx={getCustomInputStyles(isEditing)}
                            error={!!errors.phone}
                            helperText={errors.phone}
                        />
                    </Grid>

                   <Grid item xs={12} sm={6}>
                        <StyledInputLabel>Categories</StyledInputLabel>

                        {isEditing ? (
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                disableCloseOnSelect // Keeps the menu open while checking multiple boxes
                                options={(Array.isArray(allCategories) ? allCategories : []).map(cat => cat.name)}
                                value={form.categories || []}
                                onChange={handleCategoryChange}
                                renderOption={(props, option, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <li key={key} {...optionProps}>
                                            <Checkbox
                                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                                checkedIcon={<CheckBoxIcon fontSize="small" sx={{ color: '#8b5cf6' }} />}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        placeholder={form.categories?.length ? "" : "Search categories..."}
                                        sx={getCustomInputStyles(isEditing)} 
                                    />
                                )}
                            />
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
                                backgroundColor: '#e5e7eb',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {logo ? (
                                    <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <StoreIcon />
                                )}
                            </Box>

                            {isEditing && (
                                <>
                                    <input type="file" accept="image/*" id="logoUpload" hidden onChange={handleLogoChange} />
                                    <Button component="label" htmlFor="logoUpload">Upload</Button>
                                </>
                            )}
                        </Box>
                    </Grid>

                </Grid>

                {isEditing && (
                    <SaveCancelButtons onCancel={handleCancel} onSave={handleSubmit} />
                )}

            </CardContent>
        </Card>
    );
}