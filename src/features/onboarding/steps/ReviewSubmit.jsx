import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Checkbox, Avatar, CircularProgress
} from '@mui/material';
// Add this import at the top
import { useNavigate } from 'react-router-dom';

// Icons
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// 🌟 IMPORT SERVICE & CUSTOM BUTTONS
import onboardingService from '../../../features/onboarding/onboarding.service';
import GradientButton from '../../../components/shared/GradientButton/GradientButton'; // Verify path!
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton'; // Verify path!

// --- Reusable Internal Components ---
const InfoField = ({ label, value, verified = false, mandatory = false }) => (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ color: '#9ca3af', fontSize: '13px', mb: 0.5 }}>
      {label}{mandatory && <Box component="span" sx={{ color: '#ef4444' }}> *</Box>}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ color: value ? '#111827' : '#ef4444', fontSize: '14px', fontWeight: 500 }}>{value || 'Not provided'}</Typography>
      {verified && <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 18 }} />}
    </Box>
  </Box>
);

const DocumentItem = ({ label, isUploaded, mandatory = false }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 1, 
    mb: 2,
    ...(mandatory && !isUploaded && {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      p: 1,
    })
  }}>
    {isUploaded ? (
      <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 20 }} />
    ) : (
      <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 20 }} />
    )}
   <Typography sx={{ color: isUploaded ? '#374151' : '#dc2626', fontSize: '14px', fontWeight: 500 }}>
  {label}{mandatory && <Box component="span" sx={{ color: '#ef4444' }}> *</Box>} {isUploaded ? "(Uploaded)" : "(Missing)"}
</Typography> 
    
  </Box>
);

const SectionCard = ({ step, title, onEdit, children }) => (
  <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', mb: 4 }}>
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 🌟 FIXED: Updated Avatar colors to match your theme */}
          <Avatar sx={{ bgcolor: '#e0f7f6', color: '#0B8457', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>
            {step}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>{title}</Typography>
        </Box>
        <Button 
          startIcon={<EditOutlinedIcon />} 
          onClick={onEdit} 
          sx={{ color: '#111827', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: '#f3f4f6' } }}
        >
          Edit
        </Button>
      </Box>
      {children}
    </CardContent>
  </Card>
);

// --- Main Component ---
export default function ReviewSubmit({ onBack, onNext, onEditStep, sellerId: propSellerId }) {

  const sellerId = propSellerId || localStorage.getItem("sellerId");
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [data, setData] = useState({
    step1: {}, step2: {}, step3: {}, step5: {}, step6: {}
  });

  // Load all saved states from local storage to display the summary
  useEffect(() => {
    setData({
      step1: JSON.parse(localStorage.getItem('onboarding_step_1') || '{}'),
      step2: JSON.parse(localStorage.getItem('onboarding_step_2') || '{}'),
      step3: JSON.parse(localStorage.getItem('onboarding_step_3') || '{}'),
      step5: JSON.parse(localStorage.getItem('onboarding_step_5') || '{}'),
      step6: JSON.parse(localStorage.getItem('onboarding_step_6') || '{}')
    });
  }, []);

  const isSubmitEnabled = termsAccepted && !isSubmitting;

  const handleEditClick = (stepIndex) => {
    if (onEditStep) onEditStep(stepIndex);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setApiError('');

      if (!sellerId) throw new Error("Seller ID missing. Please restart onboarding.");

      // 🌟 USING THE SERVICE FILE FOR FINAL COMPLETION
      await onboardingService.completeOnboarding(sellerId);

      // Clean up everything from Local Storage on success
      localStorage.removeItem('onboarding_step_1');
      localStorage.removeItem('onboarding_step_2');
      localStorage.removeItem('onboarding_step_3');
      localStorage.removeItem('onboarding_step_5');
      localStorage.removeItem('onboarding_step_6');
      localStorage.removeItem('sellerId'); 

      onNext(); // Proceed to success screen (Step 7)

    } catch (err) {
      setApiError(err.response?.data?.message || err.message || "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const REVIEW_SECTIONS = [
    {
      step: "1", title: "Basic Information", stepIndex: 1,
      fields: [
        { label: "Full Name", value: data.step1.fullName },
        { label: "Email", value: data.step1.email, verified: true },
        { label: "Phone", value: data.step1.phone, verified: true },
        { label: "Business Type", value: data.step1.businessType ? data.step1.businessType.replace('_', ' ').toUpperCase() : '' },
      ]
    },
    {
      step: "2", title: "Business Details", stepIndex: 2,
      fields: [
        { label: "Business Name", value: data.step2.businessName },
        { label: "Store Name", value: data.step2.displayStoreName },
        { label: "GST Number", value: data.step2.hasGst ? data.step2.gstNumber : "Not applicable" },
        { label: "PAN Number", value: data.step2.panNumber },
        { label: "Business Address", value: `${data.step2.addressLine1}, ${data.step2.city || ''}, ${data.step2.state || ''} - ${data.step2.pincode || ''}`, fullWidth: true },
      ]
    },
    {
      step: "3", title: "Bank Details", stepIndex: 3,
      fields: [
        { label: "Account Holder Name", value: data.step3.accountName },
        { label: "Account Number", value: data.step3.accountNumber },
        { label: "IFSC Code", value: data.step3.ifscCode },
        { label: "Bank Document", value: data.step3.documentName },
      ]
    },
    {
      step: "4", title: "Documents", stepIndex: 4,
      fields: [
        { label: "GST Certificate", isDocument: true, isUploaded: !!data.step5.gstProof, mandatory: true },
        { label: "PAN Card", isDocument: true, isUploaded: !!data.step5.panCard },
        { label: "Aadhaar Front", isDocument: true, isUploaded: !!data.step5.aadhaarFront },
        { label: "Aadhaar Back", isDocument: true, isUploaded: !!data.step5.aadhaarBack },
        { label: "Signature", isDocument: true, isUploaded: !!data.step5.signature },
      ]
    },
    {
      step: "5", title: "Store Setup", stepIndex: 5,
      fields: [
        { label: "Product Categories", value: data.step6.selectedCategories?.join(', '), fullWidth: true },
        { label: "Shipping Preference", value: data.step6.shippingPreference === 'platform' ? 'Platform Logistics' : 'Self Shipping', fullWidth: true },
      ]
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>Review Your Application</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '15px' }}>Please review all information before submitting</Typography>
        </Box>

        {apiError && (
          <Box sx={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', p: 2, borderRadius: '8px', mb: 4, textAlign: 'center' }}>
            <Typography color="error" fontWeight="600">{apiError}</Typography>
          </Box>
        )}

        {REVIEW_SECTIONS.map((section) => (
          <SectionCard 
            key={section.step} 
            step={section.step} 
            title={section.title} 
            onEdit={() => handleEditClick(section.stepIndex)} 
          >
            <Grid container spacing={2}>
              {section.fields.map((field, index) => (
                <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={index}>
                 {field.isDocument ? (
  <DocumentItem label={field.label} isUploaded={field.isUploaded} mandatory={field.mandatory} />
) : (
  <InfoField label={field.label} value={field.value} verified={field.verified} mandatory={field.mandatory} />
)}
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        ))}

        <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', boxShadow: 'none', mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disableRipple sx={{ p: 0, mt: -0.25, '&.Mui-checked': { color: '#111827' } }} />
             <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
  <Box component="span" sx={{ color: '#4b5563' }}>I accept the </Box>
  <Box
    component="span"
    onClick={() => window.open('/terms-and-conditions', '_blank')}
    sx={{ fontWeight: 600, color: '#0B8457', cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: '#065f46' } }}
  >
    Terms & Conditions
  </Box>
  <Box component="span" sx={{ color: '#4b5563' }}> — By checking this, you agree to our seller terms, privacy policy, and platform guidelines.</Box>
</Typography>
            </Box>
           
          </CardContent>
        </Card>

        {/* 🌟 FIXED: Replaced standard buttons with your custom Gradient components */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <GradientOutlineButton 
            onClick={onBack} 
            disabled={isSubmitting} 
            sx={{ 
              flex: 1, 
              maxWidth: { xs: '100%', sm: '300px' }, 
              py: 1.5, 
              fontSize: '16px',
              textTransform: 'none' // Keeps it matching original design
            }}
          >
            &larr; Back
          </GradientOutlineButton>

          <GradientButton
            disabled={!isSubmitEnabled}
            onClick={handleSubmit}
            startIcon={!isSubmitting && <ShieldOutlinedIcon />}
            sx={{
              flex: 2,
              width: { xs: '100%', sm: 'auto' },
              py: 1.5,
              fontSize: '16px',
              textTransform: 'none', // Keeps it matching original design
              ...(isSubmitEnabled && {
                boxShadow: '0 4px 14px 0 rgba(11, 132, 87, 0.39)' // Updated glow to match green theme
              })
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
          </GradientButton>
        </Box>
      </Box>
    </Box>
  );
}
