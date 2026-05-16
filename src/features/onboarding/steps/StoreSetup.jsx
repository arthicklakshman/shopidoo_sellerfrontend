import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Checkbox,
  FormControlLabel, Switch, Radio, RadioGroup, TextField, InputLabel, FormHelperText, CircularProgress
} from '@mui/material';

// Icons
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'; 

// 🌟 IMPORT SERVICE
import onboardingService from '../../../features/onboarding/onboarding.service';

// 🌟 REUSABLE COMPONENTS
import StepWrapper from '../../../features/onboarding/components/StepWrapper';
import NavigationButtons from '../../../features/onboarding/components/NavigationButtons';
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';
import ImagePreview from './ImagePreview'; 

// Import Validation & Base64 Helpers
import { validateRequired } from '../../../utils/validation';
import { convertToBase64 } from '../../../utils/fileHelpers';

const OrangeBullet = () => (
  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ea580c', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
);

const StyledInputLabel = ({ children, required }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{children}</InputLabel>
    {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>}
  </Box>
);

// 🌟 ImageUploadZone
const ImageUploadZone = ({ title, required, recommendedSize, fileData, onChange, error, onPreview }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{title}</Typography>
      {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '15px', fontWeight: 600 }}>*</Typography>}
    </Box>
    <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 2 }}>{recommendedSize}</Typography>

    <Box component="label" sx={{ border: '1.5px dashed', borderColor: error ? '#ef4444' : '#d1d5db', borderRadius: '12px', p: { xs: 3, sm: 4 }, textAlign: 'center', backgroundColor: error ? '#fef2f2' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, '&:hover': { backgroundColor: fileData ? '#ffffff' : '#f9fafb', borderColor: fileData ? '#d1d5db' : '#9ca3af', cursor: fileData ? 'default' : 'pointer' } }}>
      
      {!fileData && (
        <input type="file" hidden accept="image/png, image/jpeg, image/jpg" onChange={(e) => onChange(e.target.files[0])} />
      )}

      {fileData ? (
        <>
          <InsertPhotoOutlinedIcon sx={{ fontSize: 32, color: '#ea580c' }} />
          <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{fileData.name}</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<VisibilityOutlinedIcon />}
              sx={{ color: '#059669', textTransform: 'none' }} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPreview(fileData);
              }}
            >
              Preview
            </Button>
            <Button 
              variant="text" 
              size="small" 
              color="error" 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onChange(null); 
              }}
            >
              Remove
            </Button>
          </Box>
        </>
      ) : (
        <>
          <FileUploadOutlinedIcon sx={{ fontSize: 32, color: error ? '#ef4444' : '#6b7280' }} />
          <Typography sx={{ color: error ? '#ef4444' : '#4b5563', fontSize: '14px', fontWeight: 500 }}>Drag & drop or click to upload</Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 1 }}>JPG, PNG (Max 5MB)</Typography>
          <GradientOutlineButton size="small" component="span">Choose File</GradientOutlineButton>
        </>
      )}
    </Box>
    {error && <FormHelperText error sx={{ mt: 1 }}>{error}</FormHelperText>}
  </Box>
);

export default function StoreSetup({ onBack, onNext }) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('onboarding_step_6');
    return savedData ? JSON.parse(savedData) : {
      storeLogo: null,
      storeBanner: null,
      selectedCategories: [],
      sameAsBusinessAddress: true,
      pickupAddress: '',
      shippingPreference: 'platform'
    };
  });

  const [errors, setErrors] = useState({});
  const [businessAddressText, setBusinessAddressText] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [apiError, setApiError] = useState('');      

  const [dbCategories, setDbCategories] = useState([]);

  const [previewState, setPreviewState] = useState({
    open: false,
    fileData: null,
    fileName: ""
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await onboardingService.getCategories();
        setDbCategories(response.data.data); 
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const step2Data = JSON.parse(localStorage.getItem('onboarding_step_2') || '{}');
    if (step2Data.addressLine1) {
      const addressParts = [
        step2Data.addressLine1,
        step2Data.addressLine2,
        step2Data.city,
        step2Data.state ? step2Data.state.replace('_', ' ').toUpperCase() : '',
        step2Data.pincode ? `- ${step2Data.pincode}` : ''
      ].filter(Boolean).join(', ');
      setBusinessAddressText(addressParts);
    } else {
      setBusinessAddressText("No business address found. Please go back to Step 2.");
    }
  }, []);

  useEffect(() => {
    const safeStorageData = {
      ...formData,
      storeLogo: formData.storeLogo ? { name: formData.storeLogo.name } : null,
      storeBanner: formData.storeBanner ? { name: formData.storeBanner.name } : null,
    };
    localStorage.setItem('onboarding_step_6', JSON.stringify(safeStorageData));
  }, [formData]);

  const handleCategoryToggle = (categoryName) => {
    setFormData(prev => {
      const newCategories = prev.selectedCategories.includes(categoryName) 
        ? prev.selectedCategories.filter(c => c !== categoryName)
        : [...prev.selectedCategories, categoryName];
      
      if (newCategories.length > 0 && errors.categories) {
        setErrors(errs => ({ ...errs, categories: null }));
      }
      return { ...prev, selectedCategories: newCategories };
    });
  };

  const handleAddressChange = (e) => {
    setFormData(prev => ({ ...prev, pickupAddress: e.target.value }));
    if (errors.pickupAddress) setErrors(prev => ({ ...prev, pickupAddress: null }));
    if (apiError) setApiError('');
  };

  const handleFileChange = async (field, file) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: null }));
      return;
    }
    if (file.size > 5000000) {
      setErrors(prev => ({ ...prev, [field]: 'File is too large. Max 5MB.' }));
      return;
    }
    try {
      const base64String = await convertToBase64(file);
      setFormData(prev => ({ ...prev, [field]: { data: base64String, name: file.name } }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
      if (apiError) setApiError('');
    } catch (error) {
      console.error("Error converting file:", error);
      setErrors(prev => ({ ...prev, [field]: 'Failed to process image.' }));
    }
  };

  const handlePreview = (fileObj) => {
    setPreviewState({
      open: true,
      fileData: fileObj.data, 
      fileName: fileObj.name
    });
  };

  const handleContinue = async () => {
    const newErrors = {};

    if (!formData.storeLogo || !formData.storeLogo.data) {
      newErrors.logo = "Store Logo is required. Please re-upload if it was lost during refresh.";
    }
    
    if (formData.selectedCategories.length === 0) {
      newErrors.categories = "Please select at least one product category";
    }
    
    if (!formData.sameAsBusinessAddress) {
      newErrors.pickupAddress = validateRequired(formData.pickupAddress, 'Pickup Address');
    }

    const actualErrors = Object.entries(newErrors).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) acc[key] = value;
      return acc;
    }, {});

    if (Object.keys(actualErrors).length > 0) {
      setErrors(actualErrors);
      return; 
    }

    try {
      setIsLoading(true);
      setApiError('');

      const sellerId = localStorage.getItem('sellerId'); 
      if (!sellerId) throw new Error("Seller ID missing. Please restart onboarding.");

      const payload = {
        categories: JSON.stringify(formData.selectedCategories), 
        shippingPreference: formData.shippingPreference,
        pickupAddress: formData.sameAsBusinessAddress ? businessAddressText : formData.pickupAddress
      };

      if (formData.storeLogo?.data) payload.storeLogo = formData.storeLogo.data;
      if (formData.storeBanner?.data) payload.storeBanner = formData.storeBanner.data;

      await onboardingService.updateStoreSetup(sellerId, payload);

      onNext(); 

    } catch (err) {
      setApiError(err.response?.data?.message || 'Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto" alignItems="flex-start">
        
        {/* Left Column: Info Cards */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ borderRadius: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ color: '#ea580c', mb: 3 }}><StorefrontOutlinedIcon sx={{ fontSize: 32 }} /></Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Your Storefront</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><OrangeBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Logo: </Box>Use your brand logo for better recognition</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><OrangeBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Banner: </Box>Showcase your best products</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><OrangeBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Categories: </Box>Help customers find your products</Typography></Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <LocalShippingOutlinedIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
                <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Platform Logistics (Recommended)</Typography>
              </Box>
              <Typography sx={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>Let us handle shipping with pre-negotiated rates. Faster delivery, better tracking, and hassle-free returns.</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Setup Forms */}
        <Grid item xs={12} md={8}>
          <StepWrapper>
            {apiError && (
              <Box sx={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', p: 2, borderRadius: '8px', mb: 3 }}>
                <Typography color="error" fontSize="14px" fontWeight="600">{apiError}</Typography>
              </Box>
            )}

            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Store Setup</Typography>

            {/* 🌟 STATIC SCROLL WRAPPER START */}
            <Box 
              sx={{ 
                maxHeight: '550px', 
                overflowY: 'auto', 
                pr: 2, 
                mb: 3,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: '#9ca3af' }
              }}
            >
              <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, py: 1 }}>Store Branding</Typography>
              <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <ImageUploadZone title="Store Logo" required={true} recommendedSize="Square image recommended (500x500px)" fileData={formData.storeLogo} onChange={(file) => handleFileChange('storeLogo', file)} error={errors.logo} onPreview={handlePreview} />
                  <ImageUploadZone title="Store Banner (Optional)" required={false} recommendedSize="Banner for store page (1200x400px)" fileData={formData.storeBanner} onChange={(file) => handleFileChange('storeBanner', file)} onPreview={handlePreview} />
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, py: 1, mt: 2 }}>
                <CategoryOutlinedIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px' }}>Product Categories</Typography>
                <Typography sx={{ color: '#ef4444', fontSize: '16px', fontWeight: 600 }}>*</Typography>
              </Box>
              <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 2 }}>Select all categories that apply to your products</Typography>

              <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: errors.categories ? '#ef4444' : '#e5e7eb', boxShadow: 'none', mb: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Grid container spacing={2}>
                    {dbCategories.map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category.id}>
                        <FormControlLabel 
                          control={
                            <Checkbox 
                              checked={formData.selectedCategories.includes(category.name)} 
                              onChange={() => handleCategoryToggle(category.name)} 
                              size="small" 
                              sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#8b5cf6' } }} 
                            />
                          } 
                          label={<Typography sx={{ fontSize: '14px', color: '#374151' }}>{category.name}</Typography>} 
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {errors.categories && <FormHelperText error sx={{ mt: 2 }}>{errors.categories}</FormHelperText>}
                </CardContent>
              </Card>

              <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, py: 1, mt: 2 }}>Pickup Address</Typography>
              <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 4 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: formData.sameAsBusinessAddress ? 2 : 4 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Same as business address</Typography>
                    <Switch checked={formData.sameAsBusinessAddress} onChange={(e) => { setFormData(prev => ({ ...prev, sameAsBusinessAddress: e.target.checked })); if (errors.pickupAddress) setErrors(prev => ({ ...prev, pickupAddress: null })); }} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffffff' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#030712', opacity: 1 } }} />
                  </Box>

                  {formData.sameAsBusinessAddress ? (
                    <Typography sx={{ fontSize: '14px', color: '#6b7280', p: 1, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      {businessAddressText}
                    </Typography>
                  ) : (
                    <Box>
                      <StyledInputLabel required>Pickup Address</StyledInputLabel>
                      <TextField fullWidth value={formData.pickupAddress} onChange={handleAddressChange} placeholder="Enter complete pickup address" variant="outlined" size="small" error={!!errors.pickupAddress} helperText={errors.pickupAddress} sx={{ backgroundColor: '#f3f4f6', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' } }} />
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, py: 1, mt: 2 }}>Shipping Preference</Typography>
              <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <RadioGroup value={formData.shippingPreference} onChange={(e) => setFormData(prev => ({ ...prev, shippingPreference: e.target.value }))}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                      <Radio value="platform" sx={{ mt: -0.5, color: '#d1d5db', '&.Mui-checked': { color: '#ca8a04' } }} />
                      <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 0.5 }}>Platform Logistics (Recommended)</Typography>
                        <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>Let us handle shipping with pre-negotiated rates and better tracking</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Radio value="self" sx={{ mt: -0.5, color: '#d1d5db', '&.Mui-checked': { color: '#ca8a04' } }} />
                      <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 0.5 }}>Self Shipping</Typography>
                        <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>Use your own courier partners and manage shipping yourself</Typography>
                      </Box>
                    </Box>
                  </RadioGroup>
                </CardContent>
              </Card>
            </Box>
            {/* 🌟 STATIC SCROLL WRAPPER END */}

            <NavigationButtons 
              onBack={onBack} 
              onContinue={handleContinue} 
              isLoading={isLoading} 
              isLastStep={false} 
            />

          </StepWrapper>
        </Grid>
      </Grid>

      <ImagePreview 
        open={previewState.open} 
        onClose={() => setPreviewState({ ...previewState, open: false })} 
        fileData={previewState.fileData}
        fileName={previewState.fileName}
      />
    </Box>
  );
}





// import React, { useState, useEffect } from 'react';
// import {
//   Box, Typography, Card, CardContent, Grid, Button, Checkbox,
//   FormControlLabel, Switch, Radio, RadioGroup, TextField, InputLabel, FormHelperText, CircularProgress
// } from '@mui/material';

// // Icons
// import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
// import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
// import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
// import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
// import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'; // 🌟 Added Preview Icon

// // 🌟 IMPORT SERVICE (Verify this path!)
// import onboardingService from '../../../features/onboarding/onboarding.service';

// // 🌟 REUSABLE COMPONENTS
// import StepWrapper from '../../../features/onboarding/components/StepWrapper';
// import NavigationButtons from '../../../features/onboarding/components/NavigationButtons';
// import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';
// import ImagePreview from './ImagePreview'; // 🌟 Added ImagePreview Component

// // Import Validation & Base64 Helpers
// import { validateRequired } from '../../../utils/validation';
// import { convertToBase64 } from '../../../utils/fileHelpers';

// const OrangeBullet = () => (
//   <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ea580c', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
// );

// const StyledInputLabel = ({ children, required }) => (
//   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//     <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{children}</InputLabel>
//     {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>}
//   </Box>
// );

// // 🌟 Updated ImageUploadZone to handle Previews
// const ImageUploadZone = ({ title, required, recommendedSize, fileData, onChange, error, onPreview }) => (
//   <Box sx={{ mb: 4 }}>
//     <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//       <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{title}</Typography>
//       {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '15px', fontWeight: 600 }}>*</Typography>}
//     </Box>
//     <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 2 }}>{recommendedSize}</Typography>

//     <Box component="label" sx={{ border: '1.5px dashed', borderColor: error ? '#ef4444' : '#d1d5db', borderRadius: '12px', p: { xs: 3, sm: 4 }, textAlign: 'center', backgroundColor: error ? '#fef2f2' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, '&:hover': { backgroundColor: fileData ? '#ffffff' : '#f9fafb', borderColor: fileData ? '#d1d5db' : '#9ca3af', cursor: fileData ? 'default' : 'pointer' } }}>
      
//       {/* Hide input if file is uploaded */}
//       {!fileData && (
//         <input type="file" hidden accept="image/png, image/jpeg, image/jpg" onChange={(e) => onChange(e.target.files[0])} />
//       )}

//       {fileData ? (
//         <>
//           <InsertPhotoOutlinedIcon sx={{ fontSize: 32, color: '#ea580c' }} />
//           <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{fileData.name}</Typography>
          
//           {/* 🌟 Preview & Remove Buttons */}
//           <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
//             <Button
//               variant="text"
//               size="small"
//               startIcon={<VisibilityOutlinedIcon />}
//              sx={{ color: '#059669', textTransform: 'none' }} 
//               onClick={(e) => {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 onPreview(fileData);
//               }}
//             >
//               Preview
//             </Button>
//             <Button 
//               variant="text" 
//               size="small" 
//               color="error" 
//               onClick={(e) => { 
//                 e.preventDefault(); 
//                 e.stopPropagation(); 
//                 onChange(null); 
//               }}
//             >
//               Remove
//             </Button>
//           </Box>
//         </>
//       ) : (
//         <>
//           <FileUploadOutlinedIcon sx={{ fontSize: 32, color: error ? '#ef4444' : '#6b7280' }} />
//           <Typography sx={{ color: error ? '#ef4444' : '#4b5563', fontSize: '14px', fontWeight: 500 }}>Drag & drop or click to upload</Typography>
//           <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 1 }}>JPG, PNG (Max 5MB)</Typography>
          
//           <GradientOutlineButton size="small" component="span">
//             Choose File
//           </GradientOutlineButton>
//         </>
//       )}
//     </Box>
//     {error && <FormHelperText error sx={{ mt: 1 }}>{error}</FormHelperText>}
//   </Box>
// );

// export default function StoreSetup({ onBack, onNext }) {
  
//   const [formData, setFormData] = useState(() => {
//     const savedData = localStorage.getItem('onboarding_step_6');
//     return savedData ? JSON.parse(savedData) : {
//       storeLogo: null,
//       storeBanner: null,
//       selectedCategories: [],
//       sameAsBusinessAddress: true,
//       pickupAddress: '',
//       shippingPreference: 'platform'
//     };
//   });

//   const [errors, setErrors] = useState({});
//   const [businessAddressText, setBusinessAddressText] = useState('');
//   const [isLoading, setIsLoading] = useState(false); 
//   const [apiError, setApiError] = useState('');      

//   const [dbCategories, setDbCategories] = useState([]);

//   // 🌟 State for Image Preview Modal
//   const [previewState, setPreviewState] = useState({
//     open: false,
//     fileData: null,
//     fileName: ""
//   });

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await onboardingService.getCategories();
//         setDbCategories(response.data.data); 
//       } catch (err) {
//         console.error("Failed to load categories", err);
//       }
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const step2Data = JSON.parse(localStorage.getItem('onboarding_step_2') || '{}');
//     if (step2Data.addressLine1) {
//       const addressParts = [
//         step2Data.addressLine1,
//         step2Data.addressLine2,
//         step2Data.city,
//         step2Data.state ? step2Data.state.replace('_', ' ').toUpperCase() : '',
//         step2Data.pincode ? `- ${step2Data.pincode}` : ''
//       ].filter(Boolean).join(', ');
//       setBusinessAddressText(addressParts);
//     } else {
//       setBusinessAddressText("No business address found. Please go back to Step 2.");
//     }
//   }, []);

//   useEffect(() => {
//     const safeStorageData = {
//       ...formData,
//       storeLogo: formData.storeLogo ? { name: formData.storeLogo.name } : null,
//       storeBanner: formData.storeBanner ? { name: formData.storeBanner.name } : null,
//     };
//     localStorage.setItem('onboarding_step_6', JSON.stringify(safeStorageData));
//   }, [formData]);

//   const handleCategoryToggle = (categoryName) => {
//     setFormData(prev => {
//       const newCategories = prev.selectedCategories.includes(categoryName) 
//         ? prev.selectedCategories.filter(c => c !== categoryName)
//         : [...prev.selectedCategories, categoryName];
      
//       if (newCategories.length > 0 && errors.categories) {
//         setErrors(errs => ({ ...errs, categories: null }));
//       }
//       return { ...prev, selectedCategories: newCategories };
//     });
//   };

//   const handleAddressChange = (e) => {
//     setFormData(prev => ({ ...prev, pickupAddress: e.target.value }));
//     if (errors.pickupAddress) setErrors(prev => ({ ...prev, pickupAddress: null }));
//     if (apiError) setApiError('');
//   };

//   const handleFileChange = async (field, file) => {
//     if (!file) {
//       setFormData(prev => ({ ...prev, [field]: null }));
//       return;
//     }
//     if (file.size > 5000000) {
//       setErrors(prev => ({ ...prev, [field]: 'File is too large. Max 5MB.' }));
//       return;
//     }
//     try {
//       const base64String = await convertToBase64(file);
//       setFormData(prev => ({ ...prev, [field]: { data: base64String, name: file.name } }));
//       if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
//       if (apiError) setApiError('');
//     } catch (error) {
//       console.error("Error converting file:", error);
//       setErrors(prev => ({ ...prev, [field]: 'Failed to process image.' }));
//     }
//   };

//   // 🌟 Helper function to open preview
//   const handlePreview = (fileObj) => {
//     setPreviewState({
//       open: true,
//       fileData: fileObj.data, // Contains the base64 string
//       fileName: fileObj.name
//     });
//   };

//   const handleContinue = async () => {
//     const newErrors = {};

//     if (!formData.storeLogo || !formData.storeLogo.data) {
//       newErrors.logo = "Store Logo is required. Please re-upload if it was lost during refresh.";
//     }
    
//     if (formData.selectedCategories.length === 0) {
//       newErrors.categories = "Please select at least one product category";
//     }
    
//     if (!formData.sameAsBusinessAddress) {
//       newErrors.pickupAddress = validateRequired(formData.pickupAddress, 'Pickup Address');
//     }

//     const actualErrors = Object.entries(newErrors).reduce((acc, [key, value]) => {
//       if (value !== null && value !== undefined) acc[key] = value;
//       return acc;
//     }, {});

//     if (Object.keys(actualErrors).length > 0) {
//       setErrors(actualErrors);
//       return; 
//     }

//     try {
//       setIsLoading(true);
//       setApiError('');

//       const sellerId = localStorage.getItem('sellerId'); 
//       if (!sellerId) throw new Error("Seller ID missing. Please restart onboarding.");

//       const payload = {
//         categories: JSON.stringify(formData.selectedCategories), 
//         shippingPreference: formData.shippingPreference,
//         pickupAddress: formData.sameAsBusinessAddress ? businessAddressText : formData.pickupAddress
//       };

//       if (formData.storeLogo?.data) payload.storeLogo = formData.storeLogo.data;
//       if (formData.storeBanner?.data) payload.storeBanner = formData.storeBanner.data;

//       await onboardingService.updateStoreSetup(sellerId, payload);

//       onNext(); 

//     } catch (err) {
//       setApiError(err.response?.data?.message || 'Server connection failed.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
//       <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto" alignItems="flex-start">
        
//         {/* Left Column: Info Cards */}
//         <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           <Card sx={{ borderRadius: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', boxShadow: 'none' }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//               <Box sx={{ color: '#ea580c', mb: 3 }}><StorefrontOutlinedIcon sx={{ fontSize: 32 }} /></Box>
//               <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Your Storefront</Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><OrangeBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Logo: </Box>Use your brand logo for better recognition</Typography></Box>
//                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><OrangeBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Banner: </Box>Showcase your best products</Typography></Box>
//                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><OrangeBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Categories: </Box>Help customers find your products</Typography></Box>
//               </Box>
//             </CardContent>
//           </Card>

//           <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
//                 <LocalShippingOutlinedIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
//                 <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Platform Logistics (Recommended)</Typography>
//               </Box>
//               <Typography sx={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>Let us handle shipping with pre-negotiated rates. Faster delivery, better tracking, and hassle-free returns.</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column: Setup Forms */}
//         <Grid item xs={12} md={8}>
          
//           <StepWrapper>
//             {apiError && (
//               <Box sx={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', p: 2, borderRadius: '8px', mb: 3 }}>
//                 <Typography color="error" fontSize="14px" fontWeight="600">{apiError}</Typography>
//               </Box>
//             )}

//             <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Store Setup</Typography>

//             <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2 }}>Store Branding</Typography>
//             <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 4 }}>
//               <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//                 <ImageUploadZone title="Store Logo" required={true} recommendedSize="Square image recommended (500x500px)" fileData={formData.storeLogo} onChange={(file) => handleFileChange('storeLogo', file)} error={errors.logo} onPreview={handlePreview} />
//                 <ImageUploadZone title="Store Banner (Optional)" required={false} recommendedSize="Banner for store page (1200x400px)" fileData={formData.storeBanner} onChange={(file) => handleFileChange('storeBanner', file)} onPreview={handlePreview} />
//               </CardContent>
//             </Card>

//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//               <CategoryOutlinedIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
//               <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px' }}>Product Categories</Typography>
//               <Typography sx={{ color: '#ef4444', fontSize: '16px', fontWeight: 600 }}>*</Typography>
//             </Box>
//             <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 2 }}>Select all categories that apply to your products</Typography>

//             <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: errors.categories ? '#ef4444' : '#e5e7eb', boxShadow: 'none', mb: 4 }}>
//               <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//                 <Grid container spacing={2}>
//                   {dbCategories.map((category) => (
//                     <Grid item xs={12} sm={6} md={4} key={category.id}>
//                       <FormControlLabel 
//                         control={
//                           <Checkbox 
//                             checked={formData.selectedCategories.includes(category.name)} 
//                             onChange={() => handleCategoryToggle(category.name)} 
//                             size="small" 
//                             sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#8b5cf6' } }} 
//                           />
//                         } 
//                         label={<Typography sx={{ fontSize: '14px', color: '#374151' }}>{category.name}</Typography>} 
//                       />
//                     </Grid>
//                   ))}
//                 </Grid>
//                 {errors.categories && <FormHelperText error sx={{ mt: 2 }}>{errors.categories}</FormHelperText>}
//               </CardContent>
//             </Card>

//             <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2 }}>Pickup Address</Typography>
//             <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 4 }}>
//               <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: formData.sameAsBusinessAddress ? 2 : 4 }}>
//                   <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Same as business address</Typography>
//                   <Switch checked={formData.sameAsBusinessAddress} onChange={(e) => { setFormData(prev => ({ ...prev, sameAsBusinessAddress: e.target.checked })); if (errors.pickupAddress) setErrors(prev => ({ ...prev, pickupAddress: null })); }} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffffff' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#030712', opacity: 1 } }} />
//                 </Box>

//                 {formData.sameAsBusinessAddress ? (
//                   <Typography sx={{ fontSize: '14px', color: '#6b7280', p: 1, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
//                     {businessAddressText}
//                   </Typography>
//                 ) : (
//                   <Box>
//                     <StyledInputLabel required>Pickup Address</StyledInputLabel>
//                     <TextField fullWidth value={formData.pickupAddress} onChange={handleAddressChange} placeholder="Enter complete pickup address" variant="outlined" size="small" error={!!errors.pickupAddress} helperText={errors.pickupAddress} sx={{ backgroundColor: '#f3f4f6', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' } }} />
//                   </Box>
//                 )}
//               </CardContent>
//             </Card>

//             <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2 }}>Shipping Preference</Typography>
//             <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
//               <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//                 <RadioGroup value={formData.shippingPreference} onChange={(e) => setFormData(prev => ({ ...prev, shippingPreference: e.target.value }))}>
//                   <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
//                     <Radio value="platform" sx={{ mt: -0.5, color: '#d1d5db', '&.Mui-checked': { color: '#ca8a04' } }} />
//                     <Box>
//                       <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 0.5 }}>Platform Logistics (Recommended)</Typography>
//                       <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>Let us handle shipping with pre-negotiated rates and better tracking</Typography>
//                     </Box>
//                   </Box>
//                   <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
//                     <Radio value="self" sx={{ mt: -0.5, color: '#d1d5db', '&.Mui-checked': { color: '#ca8a04' } }} />
//                     <Box>
//                       <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 0.5 }}>Self Shipping</Typography>
//                       <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>Use your own courier partners and manage shipping yourself</Typography>
//                     </Box>
//                   </Box>
//                 </RadioGroup>
//               </CardContent>
//             </Card>

//             <NavigationButtons 
//               onBack={onBack} 
//               onContinue={handleContinue} 
//               isLoading={isLoading} 
//               isLastStep={false} 
//             />

//           </StepWrapper>
//         </Grid>
//       </Grid>

//       {/* 🌟 Reusable Modal Component */}
//       <ImagePreview 
//         open={previewState.open} 
//         onClose={() => setPreviewState({ ...previewState, open: false })} 
//         fileData={previewState.fileData}
//         fileName={previewState.fileName}
//       />
//     </Box>
//   );
// }