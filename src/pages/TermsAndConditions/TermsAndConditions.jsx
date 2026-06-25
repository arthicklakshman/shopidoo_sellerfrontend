import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';

export default function TermsAndConditions() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By registering as a seller on our platform, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not proceed with registration."
    },
    {
      title: "2. Seller Eligibility",
      content: "To become a seller, you must be at least 18 years of age, possess a valid PAN card, have a registered business entity (individual, partnership, or company), and provide accurate banking information for payment processing."
    },
    {
      title: "3. Account Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility. You must notify us immediately of any unauthorized use of your account."
    },
    {
      title: "4. Product Listings",
      content: "All products listed must comply with applicable laws and regulations. You must not list counterfeit, prohibited, or restricted items. Product descriptions, images, and pricing must be accurate and not misleading."
    },
    {
      title: "5. Pricing & Commissions",
      content: "Sellers are free to set their own product prices. The platform charges a commission on each successful sale as per the agreed commission structure. Prices must include all applicable taxes (GST). The platform reserves the right to revise commission rates with prior notice."
    },
    {
      title: "6. Order Fulfillment",
      content: "Sellers must fulfill orders within the agreed processing time. You are responsible for proper packaging to prevent damage during transit. Failure to fulfill orders repeatedly may result in account suspension."
    },
    {
      title: "7. Payments & Settlements",
      content: "Payments will be settled to your registered bank account after deducting applicable commissions and fees. Settlement cycles are processed weekly. Any disputes regarding payments must be raised within 30 days."
    },
    {
      title: "8. Returns & Refunds",
      content: "Sellers must comply with the platform's return and refund policy. Refunds will be deducted from the seller's account in cases of verified return claims. Sellers may dispute return requests through the seller dashboard."
    },
    {
      title: "9. Termination",
      content: "The platform reserves the right to suspend or terminate your seller account for violation of these terms, fraudulent activity, consistent poor performance, or receipt of excessive negative reviews."
    },
    {
      title: "10. Amendments",
      content: "We reserve the right to modify these Terms & Conditions at any time. Sellers will be notified of significant changes via email or platform notifications. Continued use of the platform after changes constitutes acceptance of the updated terms."
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', px: { xs: 2, md: 4 } }}>

        <Button
          onClick={() => window.close()}
          sx={{ mb: 3, textTransform: 'none', color: '#0B8457', fontWeight: 600, fontSize: '14px' }}
        >
          ← Back
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
            Terms & Conditions
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
            Last updated: June 2025 &nbsp;|&nbsp; Please read these terms carefully before proceeding.
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Intro */}
        <Box sx={{ backgroundColor: '#e0f7f6', borderRadius: '12px', p: 3, mb: 4 }}>
          <Typography sx={{ color: '#065f46', fontSize: '14px', lineHeight: 1.8 }}>
            These Terms & Conditions govern your use of our seller platform. By completing registration,
            you confirm that you have read, understood, and agreed to all terms listed below.
          </Typography>
        </Box>

        {/* Sections */}
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#111827', mb: 1 }}>
              {section.title}
            </Typography>
            <Typography sx={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.8 }}>
              {section.content}
            </Typography>
            {index < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}

        {/* Footer note */}
        <Box sx={{ backgroundColor: '#f3f4f6', borderRadius: '12px', p: 3, mt: 4 }}>
          <Typography sx={{ color: '#374151', fontSize: '13px', lineHeight: 1.8 }}>
            For any questions regarding these Terms & Conditions, please contact our support team at{' '}
            <Box component="span" sx={{ fontWeight: 600, color: '#0B8457' }}>support@yourplatform.com</Box>
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}