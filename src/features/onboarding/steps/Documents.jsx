import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, FormHelperText, Switch
} from '@mui/material';

// Icons
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'; // 🌟 Added Preview Icon

// 🌟 IMPORT SERVICE
import onboardingService from '../../../features/onboarding/onboarding.service';

// Reusable Components
import StepWrapper from '../../../features/onboarding/components/StepWrapper';
import NavigationButtons from '../../../features/onboarding/components/NavigationButtons';
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';
import ImagePreview from './ImagePreview'; // 🌟 Added ImagePreview Component

// Import your Base64 Helper
import { convertToBase64 } from '../../../utils/fileHelpers';

const PurpleBullet = () => (
  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8b5cf6', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
);

// 🌟 Updated UploadZoneCard to handle the Preview action
const UploadZoneCard = ({ title, subtitle, required, fileData, onChange, error, onPreview }) => (
  <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{title}</Typography>
        {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '15px', fontWeight: 600 }}>*</Typography>}
      </Box>
      <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 3 }}>{subtitle}</Typography>

      <Box component="label" sx={{ border: '1.5px dashed', borderColor: error ? '#ef4444' : '#d1d5db', borderRadius: '12px', p: { xs: 3, sm: 4 }, textAlign: 'center', backgroundColor: error ? '#fef2f2' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, '&:hover': { backgroundColor: fileData ? '#ffffff' : '#f9fafb', borderColor: fileData ? '#d1d5db' : '#9ca3af', cursor: fileData ? 'default' : 'pointer' } }}>
        
        {/* Hide input if file is uploaded */}
        {!fileData && (
          <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files[0])} />
        )}

        {fileData ? (
          <>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: '#059669' }} />
            <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>
              {fileData.name}
            </Typography>
            
            {/* 🌟 Preview & Remove Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {fileData.data && (
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
              )}
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
            <Typography sx={{color: error ? '#ef4444' : '#4b5563', fontSize: '14px', fontWeight: 500 }}>Drag & drop or click to upload</Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 1 }}>PDF, JPG, PNG (Max 5MB)</Typography>
            
            <GradientOutlineButton size="small" component="span">
              Choose File
            </GradientOutlineButton>
          </>
        )}
      </Box>
      {error && <FormHelperText error sx={{ mt: 1, ml: 1 }}>{error}</FormHelperText>}
    </CardContent>
  </Card>
);

export default function Documents({ onBack, onNext }) {
  
  const [documents, setDocuments] = useState(() => {
    const savedData = localStorage.getItem('onboarding_step_5');
    const parsedData = savedData ? JSON.parse(savedData) : {};
    let sessionDocs = {};
    try {
      sessionDocs = JSON.parse(sessionStorage.getItem('onboarding_step_5_files') || '{}');
    } catch (e) {
      sessionDocs = {};
    }

    const getInitialDoc = (key) => {
      const sess = sessionDocs[key];
      if (sess && (sess.name || sess.data)) return sess;
      const loc = parsedData[key];
      if (loc && (loc.name || loc.data)) return loc;
      if (typeof loc === 'string' && loc.trim() !== '') return { name: 'Uploaded Document', data: loc };
      return null;
    };

    const docKeys = ['panCard', 'aadhaarFront', 'aadhaarBack', 'signature', 'businessProof', 'bankProof', 'gstProof'];
    const initial = {};
    docKeys.forEach(key => {
      initial[key] = getInitialDoc(key);
    });

    return initial;
  });

  const [showOptional, setShowOptional] = useState(false);
  
  // 🌟 State for Image Preview Modal
  const [previewState, setPreviewState] = useState({
    open: false,
    fileData: null,
    fileName: ""
  });

  // Removed hasGst logic

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); 
  const [apiError, setApiError] = useState('');      

  useEffect(() => {
    const getSafeDoc = (doc) => {
      if (!doc) return null;
      if (typeof doc === 'string') return { name: 'Uploaded Document' };
      if (typeof doc === 'object' && (doc.name || doc.data)) return { name: doc.name || 'Uploaded Document' };
      return null;
    };

    const safeStorageData = {
      panCard: getSafeDoc(documents.panCard),
      aadhaarFront: getSafeDoc(documents.aadhaarFront),
      aadhaarBack: getSafeDoc(documents.aadhaarBack),
      signature: getSafeDoc(documents.signature),
      businessProof: getSafeDoc(documents.businessProof),
      bankProof: getSafeDoc(documents.bankProof),
      gstProof: getSafeDoc(documents.gstProof),
    };
    localStorage.setItem('onboarding_step_5', JSON.stringify(safeStorageData));

    try {
      sessionStorage.setItem('onboarding_step_5_files', JSON.stringify(documents));
    } catch (e) {
      console.warn('sessionStorage failed for documents', e);
    }
  }, [documents]);

  const handleFileChange = async (field, file) => {
    if (!file) {
      setDocuments((prev) => ({ ...prev, [field]: null }));
      return;
    }

    if (file.size > 5000000) {
      setErrors((prev) => ({ ...prev, [field]: 'File is too large. Max 5MB.' }));
      return;
    }

    try {
      const base64String = await convertToBase64(file);
      setDocuments((prev) => ({ 
        ...prev, 
        [field]: { data: base64String, name: file.name } 
      }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
      if (apiError) setApiError('');
    } catch (error) {
      console.error("Error converting file:", error);
      setErrors((prev) => ({ ...prev, [field]: 'Failed to process file.' }));
    }
  };

  // 🌟 Helper function to open preview
  const handlePreview = (fileObj) => {
    setPreviewState({
      open: true,
      fileData: fileObj.data, // Contains the base64 string
      fileName: fileObj.name
    });
  };

  const isDocPresent = (doc) => !!(doc && (doc.name || doc.data || (typeof doc === 'string' && doc.trim() !== '')));

  const handleContinue = async () => {
    const newErrors = {};
    
    if (!isDocPresent(documents.gstProof)) newErrors.gstProof = "GST Proof is required";
    if (!isDocPresent(documents.signature)) newErrors.signature = "Signature is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    try {
      setIsLoading(true);
      setApiError('');

      const sellerId = localStorage.getItem('sellerId'); 
      if (!sellerId) throw new Error("Seller ID missing. Please restart onboarding.");

      const payload = {};
      if (documents.panCard?.data) payload.panCardImage = documents.panCard.data;
      if (documents.aadhaarFront?.data) payload.aadhaarFrontImage = documents.aadhaarFront.data;
      if (documents.aadhaarBack?.data) payload.aadhaarBackImage = documents.aadhaarBack.data;
      if (documents.signature?.data) payload.signatureImage = documents.signature.data;
      if (documents.businessProof?.data) payload.businessProofImage = documents.businessProof.data;
      if (documents.bankProof?.data) payload.bankProofImage = documents.bankProof.data;
      if (documents.gstProof?.data) payload.gstProofImage = documents.gstProof.data;

      if (Object.keys(payload).length > 0) {
        await onboardingService.updateDocuments(sellerId, payload);
      }

      onNext();

    } catch (err) {
      setApiError(err.response?.data?.message || 'Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
        
        {/* Left Column: Info Cards */}
<Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 3 }}>
  <Card sx={{ borderRadius: '16px', backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', boxShadow: 'none' }}>
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box sx={{ color: '#0B8457', mb: 3 }}>
        <DescriptionOutlinedIcon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
        Document Upload
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0B8457', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
          <Typography sx={{ color: '#4b5563', fontSize: '14px' }}>
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Verification: </Box>
            Documents are verified within 24-48 hours
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0B8457', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
          <Typography sx={{ color: '#4b5563', fontSize: '14px' }}>
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Clear Images: </Box>
            Ensure all text is readable
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0B8457', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
          <Typography sx={{ color: '#4b5563', fontSize: '14px' }}>
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>File Format: </Box>
            PDF, JPG, or PNG accepted
          </Typography>
        </Box>
        
      </Box>
    </CardContent>
  </Card>

  <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <ShieldOutlinedIcon sx={{ color: '#0B8457', fontSize: 22 }} />
        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>
          Privacy & Security
        </Typography>
      </Box>
      <Typography sx={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
        All documents are encrypted and stored securely.
      </Typography>
    </CardContent>
  </Card>
</Grid>

        {/* Right Column: Upload Forms */}
        <Grid item xs={12} md={8}>
          
          <StepWrapper>
            {apiError && (
              <Box sx={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', p: 2, borderRadius: '8px', mb: 3 }}>
                <Typography color="error" fontSize="14px" fontWeight="600">{apiError}</Typography>
              </Box>
            )}

            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>Upload Documents</Typography>

            {/* 🌟 STATIC SCROLL WRAPPER START */}
            <Box 
              sx={{ 
                maxHeight: { xs: 'none', md: '550px' }, 
                overflowY: { xs: 'visible', md: 'auto' }, 
                pr: 2, 
                mb: 3,
                // Custom slim scrollbar for a clean UI
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: '#9ca3af' }
              }}
            >
              <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, py: 1 }}>
                Required Documents
              </Typography>
              
              <UploadZoneCard title="GST Proof Image" subtitle="Upload your GST Registration Certificate" required fileData={documents.gstProof} onChange={(file) => handleFileChange('gstProof', file)} error={errors.gstProof} onPreview={handlePreview} />
              <UploadZoneCard title="Signature" subtitle="Upload your signature on white paper" required fileData={documents.signature} onChange={(file) => handleFileChange('signature', file)} error={errors.signature} onPreview={handlePreview} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, py: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px' }}>
                  Optional Documents
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>Add additional information</Typography>
                  <Switch 
                    checked={showOptional} 
                    onChange={(e) => setShowOptional(e.target.checked)} 
                    size="small" 
                    sx={{ 
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffffff' }, 
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#059669', opacity: 1 } 
                    }} 
                  />
                </Box>
              </Box>

              {showOptional && (
                <>
                  <UploadZoneCard title="PAN Card" subtitle="Upload clear image of your PAN card" required={false} fileData={documents.panCard} onChange={(file) => handleFileChange('panCard', file)} error={errors.panCard} onPreview={handlePreview} />
                  <UploadZoneCard title="Aadhaar Card (Front)" subtitle="Upload front side of your Aadhaar card" required={false} fileData={documents.aadhaarFront} onChange={(file) => handleFileChange('aadhaarFront', file)} error={errors.aadhaarFront} onPreview={handlePreview} />
                  <UploadZoneCard title="Aadhaar Card (Back)" subtitle="Upload back side of your Aadhaar card" required={false} fileData={documents.aadhaarBack} onChange={(file) => handleFileChange('aadhaarBack', file)} error={errors.aadhaarBack} onPreview={handlePreview} />
                  <UploadZoneCard title="Business Proof" subtitle="Shop license, rent agreement, etc." required={false} fileData={documents.businessProof} onChange={(file) => handleFileChange('businessProof', file)} onPreview={handlePreview} />
                  <UploadZoneCard title="Bank Proof" subtitle="Additional bank statement or passbook" required={false} fileData={documents.bankProof} onChange={(file) => handleFileChange('bankProof', file)} onPreview={handlePreview} />
                </>
              )}
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
      </Box>

      {/* 🌟 Reusable Modal Component */}
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
//   Box, Typography, Card, CardContent, Grid, Button, FormHelperText
// } from '@mui/material';

// // Icons
// import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
// import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
// import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
// import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

// // 🌟 IMPORT SERVICE
// import onboardingService from '../../../features/onboarding/onboarding.service';

// // Reusable Components
// import StepWrapper from '../../../features/onboarding/components/StepWrapper';
// import NavigationButtons from '../../../features/onboarding/components/NavigationButtons';

// // Import your Base64 Helper
// import { convertToBase64 } from '../../../utils/fileHelpers';

// const PurpleBullet = () => (
//   <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8b5cf6', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
// );

// const UploadZoneCard = ({ title, subtitle, required, fileData, onChange, error }) => (
//   <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
//     <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//         <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{title}</Typography>
//         {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '15px', fontWeight: 600 }}>*</Typography>}
//       </Box>
//       <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 3 }}>{subtitle}</Typography>

//       <Box component="label" sx={{ border: '1.5px dashed', borderColor: error ? '#ef4444' : '#d1d5db', borderRadius: '12px', p: { xs: 3, sm: 4 }, textAlign: 'center', backgroundColor: error ? '#fef2f2' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, '&:hover': { backgroundColor: '#f9fafb', borderColor: '#9ca3af', cursor: 'pointer' } }}>
//         <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files[0])} />

//         {fileData ? (
//           <>
//             <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: '#059669' }} />
//             <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>
//               {fileData.name}
//             </Typography>
//             <Button variant="text" size="small" color="error" onClick={(e) => { e.preventDefault(); onChange(null); }}>Remove</Button>
//           </>
//         ) : (
//           <>
//             <FileUploadOutlinedIcon sx={{ fontSize: 32, color: error ? '#ef4444' : '#6b7280' }} />
//             <Typography sx={{color  : error ? '#ef4444' : '#4b5563', fontSize: '14px', fontWeight: 500 }}>Drag & drop or click to upload</Typography>
//             <Typography sx={{ color: '#9ca3af', fontSize: '12px', mb: 1 }}>PDF, JPG, PNG (Max 5MB)</Typography>
//             <Button variant="outlined" size="small" component="span" sx={{ textTransform: 'none', color: '#111827', borderColor: '#d1d5db', borderRadius: '6px', backgroundColor: '#ffffff', fontWeight: 500 }}>Choose File</Button>
//           </>
//         )}
//       </Box>
//       {error && <FormHelperText error sx={{ mt: 1, ml: 1 }}>{error}</FormHelperText>}
//     </CardContent>
//   </Card>
// );

// export default function Documents({ onBack, onNext }) {
  
//   const [documents, setDocuments] = useState(() => {
//     const savedData = localStorage.getItem('onboarding_step_5'); 
//     return savedData ? JSON.parse(savedData) : {
//       panCard: null, aadhaarFront: null, aadhaarBack: null,
//       signature: null, businessProof: null, bankProof: null 
//     };
//   });

//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false); 
//   const [apiError, setApiError] = useState('');      

//   useEffect(() => {
//     const safeStorageData = {
//       panCard: documents.panCard ? { name: documents.panCard.name } : null,
//       aadhaarFront: documents.aadhaarFront ? { name: documents.aadhaarFront.name } : null,
//       aadhaarBack: documents.aadhaarBack ? { name: documents.aadhaarBack.name } : null,
//       signature: documents.signature ? { name: documents.signature.name } : null,
//       businessProof: documents.businessProof ? { name: documents.businessProof.name } : null,
//       bankProof: documents.bankProof ? { name: documents.bankProof.name } : null,
//     };
//     localStorage.setItem('onboarding_step_5', JSON.stringify(safeStorageData));
//   }, [
//     documents.panCard?.name, documents.aadhaarFront?.name, documents.aadhaarBack?.name, 
//     documents.signature?.name, documents.businessProof?.name, documents.bankProof?.name
//   ]);

//   const handleFileChange = async (field, file) => {
//     if (!file) {
//       setDocuments((prev) => ({ ...prev, [field]: null }));
//       return;
//     }

//     if (file.size > 5000000) {
//       setErrors((prev) => ({ ...prev, [field]: 'File is too large. Max 5MB.' }));
//       return;
//     }

//     try {
//       const base64String = await convertToBase64(file);
//       setDocuments((prev) => ({ 
//         ...prev, 
//         [field]: { data: base64String, name: file.name } 
//       }));
//       if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
//       if (apiError) setApiError('');
//     } catch (error) {
//       console.error("Error converting file:", error);
//       setErrors((prev) => ({ ...prev, [field]: 'Failed to process file.' }));
//     }
//   };

//   const handleContinue = async () => {
//     const newErrors = {};
    
//     if (!documents.panCard) newErrors.panCard = "PAN Card is required";
//     if (!documents.aadhaarFront) newErrors.aadhaarFront = "Aadhaar Card (Front) is required";
//     if (!documents.aadhaarBack) newErrors.aadhaarBack = "Aadhaar Card (Back) is required";
//     if (!documents.signature) newErrors.signature = "Signature is required";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return; 
//     }

//     try {
//       setIsLoading(true);
//       setApiError('');

//       const sellerId = localStorage.getItem('sellerId'); 
//       if (!sellerId) throw new Error("Seller ID missing. Please restart onboarding.");

//       const payload = {};
//       if (documents.panCard?.data) payload.panCardImage = documents.panCard.data;
//       if (documents.aadhaarFront?.data) payload.aadhaarFrontImage = documents.aadhaarFront.data;
//       if (documents.aadhaarBack?.data) payload.aadhaarBackImage = documents.aadhaarBack.data;
//       if (documents.signature?.data) payload.signatureImage = documents.signature.data;
//       if (documents.businessProof?.data) payload.businessProofImage = documents.businessProof.data;
//       if (documents.bankProof?.data) payload.bankProofImage = documents.bankProof.data;

//       // 🌟 CALLING THE SERVICE
//       if (Object.keys(payload).length > 0) {
//         await onboardingService.updateDocuments(sellerId, payload);
//       }

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
//           <Card sx={{ borderRadius: '16px', backgroundColor: '#f9f8ff', border: '1px solid #f3e8ff', boxShadow: 'none' }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//               <Box sx={{ color: '#8b5cf6', mb: 3 }}><DescriptionOutlinedIcon sx={{ fontSize: 32 }} /></Box>
//               <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Document Upload</Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><PurpleBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Verification: </Box>Documents are verified within 24-48 hours</Typography></Box>
//                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><PurpleBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Clear Images: </Box>Ensure all text is readable</Typography></Box>
//                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}><PurpleBullet /><Typography sx={{ color: '#4b5563', fontSize: '14px' }}><Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>File Format: </Box>PDF, JPG, or PNG accepted</Typography></Box>
//               </Box>
//             </CardContent>
//           </Card>

//           <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
//                 <ShieldOutlinedIcon sx={{ color: '#059669', fontSize: 22 }} />
//                 <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Privacy & Security</Typography>
//               </Box>
//               <Typography sx={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>All documents are encrypted and stored securely.</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column: Upload Forms */}
//         <Grid item xs={12} md={8}>
          
//           <StepWrapper>
//             {apiError && (
//               <Box sx={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', p: 2, borderRadius: '8px', mb: 3 }}>
//                 <Typography color="error" fontSize="14px" fontWeight="600">{apiError}</Typography>
//               </Box>
//             )}

//             <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>Upload Documents</Typography>

//             <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mb: 2 }}>Required Documents</Typography>
            
//             <UploadZoneCard title="PAN Card" subtitle="Upload clear image of your PAN card" required fileData={documents.panCard} onChange={(file) => handleFileChange('panCard', file)} error={errors.panCard} />
//             <UploadZoneCard title="Aadhaar Card (Front)" subtitle="Upload front side of your Aadhaar card" required fileData={documents.aadhaarFront} onChange={(file) => handleFileChange('aadhaarFront', file)} error={errors.aadhaarFront} />
//             <UploadZoneCard title="Aadhaar Card (Back)" subtitle="Upload back side of your Aadhaar card" required fileData={documents.aadhaarBack} onChange={(file) => handleFileChange('aadhaarBack', file)} error={errors.aadhaarBack} />
//             <UploadZoneCard title="Signature" subtitle="Upload your signature on white paper" required fileData={documents.signature} onChange={(file) => handleFileChange('signature', file)} error={errors.signature} />

//             <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '16px', mt: 5, mb: 2 }}>Optional Documents</Typography>

//             <UploadZoneCard title="Business Proof" subtitle="Shop license, rent agreement, etc." required={false} fileData={documents.businessProof} onChange={(file) => handleFileChange('businessProof', file)} />
//             <UploadZoneCard title="Bank Proof" subtitle="Additional bank statement or passbook" required={false} fileData={documents.bankProof} onChange={(file) => handleFileChange('bankProof', file)} />

//             <NavigationButtons 
//               onBack={onBack} 
//               onContinue={handleContinue} 
//               isLoading={isLoading} 
//               isLastStep={false} 
//             />
//           </StepWrapper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }