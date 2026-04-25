// import React, { useState, useEffect } from 'react';
// import {
//     Box,
//     Typography,
//     Card,
//     CardContent,
//     Grid,
//     TextField,
//     Button,
//     InputLabel,
//     MenuItem,
//     Select,
//     OutlinedInput
// } from '@mui/material';
// import StoreIcon from '@mui/icons-material/Store';

// // ✅ Custom Helper Imports
// import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingsActions'; 
// import { convertToBase64 } from '../../utils/fileHelpers';
// import { getStoreInfo, updateStoreInfo } from '../../services/settings.service';

// // ----------------------------------------------------------------------
// // Styled Components & Helpers (Keeping your exact design)
// // ----------------------------------------------------------------------
// const StyledInputLabel = ({ children }) => (
//     <InputLabel sx={{ color: '#111827', fontSize: '14px', mb: 1, fontWeight: 400 }}>
//         {children}
//     </InputLabel>
// );

// const getCustomInputStyles = (isEditing) => ({
//     backgroundColor: '#f3f4f6', 
//     borderRadius: '8px',
//     '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
//     '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
//     '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
//         border: isEditing ? '1px solid #3b82f6' : 'none',
//     },
//     '& .MuiOutlinedInput-input': {
//         padding: '10px 14px', 
//         fontSize: '14px',
//         color: '#111827',
//         WebkitTextFillColor: '#111827', 
//     },
//     '& .Mui-disabled': {
//         WebkitTextFillColor: '#111827', 
//     }
// });

// const ALL_CATEGORIES = ["Electronics", "Fashion", "Groceries", "Home", "Beauty", "Sports"];

// // ----------------------------------------------------------------------
// // Main Component
// // ----------------------------------------------------------------------
// export default function StoreInfo() {
//     const [isEditing, setIsEditing] = useState(false);
//     const [logo, setLogo] = useState(null);
//     const [logoError, setLogoError] = useState("");

//     // State for data saved in the Database
//     const [savedData, setSavedData] = useState({
//     storeName: "",
//     email: "",
//     description: "",
//     phone: "",
//     categories: [],
//     logo: null // ✅ ADD THIS
// });

//     // Form state for active editing
//     const [form, setForm] = useState({ ...savedData });
//     const [errors, setErrors] = useState({});

//     // 🟢 1. Load data from MySQL on Mount
//     useEffect(() => {
//         const fetchRealData = async () => {
//             try {
//                 const response = await getStoreInfo();
//                 if (response.data.success) {
//                     const dbData = response.data.data;
                    
//                     // Mapping backend fields (emailId/mobileNumber) to frontend form (email/phone)
//                    const formattedData = {
//     storeName: dbData.storeName || "",
//     email: dbData.email || "",
//     description: dbData.description || "",
//     phone: dbData.phone || "",
//     categories: dbData.categories || []
// };

//                     setSavedData({ ...formattedData, logo: dbData.logo });
//                     setForm(formattedData);
//                     if (dbData.logo) setLogo(dbData.logo);
//                 }
//             } catch (err) {
//                 console.error("Failed to load store data:", err);
//             }
//         };
//         fetchRealData();
//     }, []);

//     // --- Handlers ---
//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };

//     const handleCategoryChange = (e) => {
//         const { value } = e.target;
//         setForm({
//             ...form,
//             categories: typeof value === 'string' ? value.split(',') : value,
//         });
//     };

//     const handleLogoChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         if (file.size > 2 * 1024 * 1024) {
//             setLogoError("Image must be less than 2MB");
//             setLogo(null);
//             e.target.value = ""; 
//             return;
//         }

//         setLogoError("");

//         try {
//             const base64String = await convertToBase64(file);
//             setLogo(base64String); 
//             // Save as storeLogo to match backend model
//            setForm({ ...form, logo: base64String });

//         } catch (error) {
//             console.error("Error converting image:", error);
//             setLogoError("Failed to process image");
//         }
//     };

//     const validate = () => {
//         let temp = {};
//         if (!form.storeName) temp.storeName = "Store name is required";
//         if (!form.email) temp.email = "Email is required";
//         if (!form.description) temp.description = "Description is required";
//         if (!form.phone) temp.phone = "Phone number is required";
//         if (!form.categories || form.categories.length === 0) temp.categories = "At least one category is required";

//         setErrors(temp);
//         return Object.keys(temp).length === 0;
//     };

//     const handleCancel = () => {
//         setForm({ ...savedData }); 
//         setLogo(savedData.logo || null);
//         setErrors({});
//         setIsEditing(false); 
//     };

//     const handleSubmit = async () => {
//         if (!validate()) return;

//         try {
//             const response = await updateStoreInfo(form);

//             if (response.data.success) {
//                setSavedData({ ...form, logo });
//                 setIsEditing(false);
//                 alert("Saved successfully!");
//             }
//         } catch (err) {
//             console.error("Save failed:", err);
//             alert(err.response?.data?.message || "Something went wrong.");
//         }
//     };

//     return (
//         <Card sx={{
//             borderRadius: '12px',
//             border: '1px solid #e5e7eb',
//             boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
//             maxWidth: '1000px',
//             fontFamily: 'sans-serif'
//         }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>

//                 {/* 🟢 HEADER SECTION */}
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                     <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.125rem' }}>
//                         Store Information
//                     </Typography>

//                     {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
//                 </Box>

//                 <Grid container spacing={3}>
//                     {/* Store Name */}
//                     <Grid item xs={12} sm={6}>
//                         <StyledInputLabel>Store Name</StyledInputLabel>
//                         <TextField
//                             fullWidth
//                             name="storeName"
//                             value={form.storeName}
//                             onChange={handleChange}
//                             variant="outlined"
//                             size="small"
//                             disabled={!isEditing}
//                             sx={getCustomInputStyles(isEditing)}
//                             error={!!errors.storeName}
//                             helperText={errors.storeName}
//                             placeholder="Enter store name"
//                         />
//                     </Grid>

//                     {/* Store Email */}
//                     <Grid item xs={12} sm={6}>
//                         <StyledInputLabel>Store Email</StyledInputLabel>
//                         <TextField
//                             fullWidth
//                             name="email"
//                             value={form.email}
//                             onChange={handleChange}
//                             variant="outlined"
//                             size="small"
//                             disabled={!isEditing}
//                             sx={getCustomInputStyles(isEditing)}
//                             error={!!errors.email}
//                             helperText={errors.email}
//                             placeholder="Enter store email"
//                         />
//                     </Grid>

//                     {/* Store Description */}
//                     <Grid item xs={12}>
//                         <StyledInputLabel>Store Description</StyledInputLabel>
//                         <TextField
//                             fullWidth
//                             name="description"
//                             value={form.description}
//                             onChange={handleChange}
//                             multiline
//                             rows={3}
//                             variant="outlined"
//                             disabled={!isEditing}
//                             sx={{
//                                 ...getCustomInputStyles(isEditing),
//                                 '& .MuiOutlinedInput-root': { padding: '10px 14px' }
//                             }}
//                             error={!!errors.description}
//                             helperText={errors.description}
//                             placeholder="Enter store description"
//                         />
//                     </Grid>

//                     {/* Phone Number */}
//                     <Grid item xs={12} sm={6}>
//                         <StyledInputLabel>Phone Number</StyledInputLabel>
//                         <TextField
//                             fullWidth
//                             name="phone"
//                             value={form.phone}
//                             onChange={handleChange}
//                             variant="outlined"
//                             size="small"
//                             disabled={!isEditing}
//                             sx={getCustomInputStyles(isEditing)}
//                             error={!!errors.phone}
//                             helperText={errors.phone}
//                             placeholder="Enter phone number"
//                         />
//                     </Grid>

//                     {/* Categories */}
//                     <Grid item xs={12} sm={6}>
//                         <StyledInputLabel>Categories</StyledInputLabel>
//                         {isEditing ? (
//                             <Select
//                                 multiple
//                                 fullWidth
//                                 size="small"
//                                 name="categories"
//                                 value={form.categories}
//                                 onChange={handleCategoryChange}
//                                 input={<OutlinedInput sx={getCustomInputStyles(isEditing)} />}
//                                 renderValue={(selected) => selected.join(', ')}
//                                 error={!!errors.categories}
//                             >
//                                 {ALL_CATEGORIES.map((cat) => (
//                                     <MenuItem key={cat} value={cat}>
//                                         {cat}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         ) : (
//                             <TextField
//                                 fullWidth
//                                 variant="outlined"
//                                 size="small"
//                                 disabled
//                                 value={form.categories.join(', ')}
//                                 sx={getCustomInputStyles(false)}
//                             />
//                         )}
//                         {errors.categories && (
//                             <Typography color="error" fontSize="0.75rem" mt={0.5} ml={2}>
//                                 {errors.categories}
//                             </Typography>
//                         )}
//                     </Grid>

//                     {/* Store Logo */}
//                     <Grid item xs={12}>
//                         <StyledInputLabel>Store Logo</StyledInputLabel>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
//                             <Box
//                                 sx={{
//                                     width: 64, height: 64, backgroundColor: '#e5e7eb',
//                                     borderRadius: '8px', display: 'flex', alignItems: 'center',
//                                     justifyContent: 'center', overflow: 'hidden'
//                                 }}
//                             >
//                                 {logo ? (
//                                     <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//                                 ) : (
//                                     <StoreIcon sx={{ color: '#9ca3af', fontSize: 28 }} />
//                                 )}
//                             </Box>

//                             {isEditing && (
//                                 <>
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         id="logoUpload"
//                                         style={{ display: "none" }}
//                                         onChange={handleLogoChange}
//                                     />
//                                     <Button
//                                         variant="outlined"
//                                         component="label"
//                                         htmlFor="logoUpload"
//                                         sx={{
//                                             textTransform: 'none', color: '#374151',
//                                             borderColor: '#d1d5db', borderRadius: '8px',
//                                             px: 2, py: 0.75, fontWeight: 500
//                                         }}
//                                     >
//                                         Upload New Logo
//                                     </Button>
//                                     {logoError && <Typography color="error" fontSize="12px">{logoError}</Typography>}
//                                 </>
//                             )}
//                         </Box>
//                     </Grid>
//                 </Grid>

//                 {/* 🟢 BOTTOM BUTTONS SECTION */}
//                 {isEditing && (
//                     <SaveCancelButtons 
//                         onCancel={handleCancel} 
//                         onSave={handleSubmit} 
//                     />
//                 )}

//             </CardContent>
//         </Card>
//     );
// }

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
    ListItemText
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';

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
                            <Select
                                multiple
                                fullWidth
                                size="small"
                                value={form.categories || []}
                                onChange={handleCategoryChange}
                                input={<OutlinedInput sx={getCustomInputStyles(isEditing)} />}
                                renderValue={(selected) => (selected || []).join(', ')}
                            >
                                {/* We removed the filter so all categories stay visible */}
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