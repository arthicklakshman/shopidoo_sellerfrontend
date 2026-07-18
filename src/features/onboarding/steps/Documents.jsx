import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, FormHelperText, Switch
} from '@mui/material';

// Icons
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'; 

// 🌟 IMPORT SERVICE
import onboardingService from '../../../features/onboarding/onboarding.service';

// Reusable Components
import StepWrapper from '../../../features/onboarding/components/StepWrapper';
import NavigationButtons from '../../../features/onboarding/components/NavigationButtons';
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';
import ImagePreview from './ImagePreview'; 

// Import your Base64 Helper
import { convertToBase64 } from '../../../utils/fileHelpers';

const PurpleBullet = () => (
  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8b5cf6', mt: 0.8, mr: 1.5, flexShrink: 0 }} />
);

const UploadZoneCard = ({ title, subtitle, required, fileData, onChange, error, onPreview }) => (
  <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{title}</Typography>
        {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '15px', fontWeight: 600 }}>*</Typography>}
      </Box>
      <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 3 }}>{subtitle}</Typography>

      {/* 🌟 FIX: Reduced padding slightly on the dash box for tight 320px mobile screens */}
      <Box component="label" sx={{ border: '1.5px dashed', borderColor: error ? '#ef4444' : '#d1d5db', borderRadius: '12px', p: { xs: 2.5, sm: 4 }, textAlign: 'center', backgroundColor: error ? '#fef2f2' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, '&:hover': { backgroundColor: fileData ? '#ffffff' : '#f9fafb', borderColor: fileData ? '#d1d5db' : '#9ca3af', cursor: fileData ? 'default' : 'pointer' } }}>
        
        {!fileData && (
          <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files[0])} />
        )}

        {fileData ? (
          <>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: '#059669' }} />
            
            {/* 🌟 FIX: Forces long file names to wrap or truncate instead of breaking the box */}
            <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600, wordBreak: 'break-all' }}>
              {fileData.name}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: 1 }}>
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
    return savedData ? JSON.parse(savedData) : {
      panCard: null, aadhaarFront: null, aadhaarBack: null,
      signature: null, businessProof: null, bankProof: null, gstProof: null 
    };
  });

  const [showOptional, setShowOptional] = useState(false);
  
  const [previewState, setPreviewState] = useState({
    open: false,
    fileData: null,
    fileName: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); 
  const [apiError, setApiError] = useState('');      

  useEffect(() => {
    const safeStorageData = {
      panCard: documents.panCard ? { name: documents.panCard.name } : null,
      aadhaarFront: documents.aadhaarFront ? { name: documents.aadhaarFront.name } : null,
      aadhaarBack: documents.aadhaarBack ? { name: documents.aadhaarBack.name } : null,
      signature: documents.signature ? { name: documents.signature.name } : null,
      businessProof: documents.businessProof ? { name: documents.businessProof.name } : null,
      bankProof: documents.bankProof ? { name: documents.bankProof.name } : null,
      gstProof: documents.gstProof ? { name: documents.gstProof.name } : null,
    };
    localStorage.setItem('onboarding_step_5', JSON.stringify(safeStorageData));
  }, [
    documents.panCard?.name, documents.aadhaarFront?.name, documents.aadhaarBack?.name, 
    documents.signature?.name, documents.businessProof?.name, documents.bankProof?.name,
    documents.gstProof?.name
  ]);

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

  const handlePreview = (fileObj) => {
    setPreviewState({
      open: true,
      fileData: fileObj.data, 
      fileName: fileObj.name
    });
  };

  const handleContinue = async () => {
    const newErrors = {};
    
    if (!documents.gstProof) newErrors.gstProof = "GST Proof is required";
    if (!documents.signature) newErrors.signature = "Signature is required";

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
      setApiError(err.response?.data?.message || err.message || 'Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
  
      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" maxWidth="1200px" mx="auto" alignItems="flex-start">
        
        {/* Left Column: Info Cards */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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


            <Box 
              sx={{ 
                maxHeight: { xs: 'none', md: '550px' }, 
                overflowY: { xs: 'visible', md: 'auto' }, 
                pr: { xs: 0, md: 2 }, 
                mb: 3,
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

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between', 
                gap: { xs: 1.5, sm: 0 },
                mt: 3, 
                mb: 2, 
                position: 'sticky', 
                top: 0, 
                backgroundColor: '#fff', 
                zIndex: 1, 
                py: 1 
              }}>
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