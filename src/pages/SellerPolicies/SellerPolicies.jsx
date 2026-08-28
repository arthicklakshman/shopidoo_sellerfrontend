import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import SEO from '../../components/SEO/SEO';

export default function SellerPolicies() {
  const sections = [
    {
      title: "1. Product Listing Policy",
      content: "All products must have clear titles, accurate descriptions, and high-quality images. Misleading information, duplicate listings, or prohibited items will be removed immediately. Sellers must ensure products are in stock before listing."
    },
    {
      title: "2. Pricing Policy",
      content: "Sellers must maintain fair and competitive pricing. Price manipulation, artificial inflation, or predatory pricing is strictly prohibited. All prices must be inclusive of applicable GST."
    },
    {
      title: "3. Order Processing Policy",
      content: "Orders must be confirmed and dispatched within 2 business days of placement. Sellers must update tracking information promptly. Repeated delays in order processing will result in account warnings or suspension."
    },
    {
      title: "4. Return & Refund Policy",
      content: "Sellers must accept returns for products that are damaged, defective, or not as described. Return requests must be resolved within 5 business days. Refunds will be processed once the returned product is received and verified."
    },
    {
      title: "5. Shipping Policy",
      content: "Sellers can choose platform logistics or self-shipping. Products must be securely packaged to prevent damage. Sellers opting for self-shipping are responsible for delivery timelines and any shipping disputes."
    },
    {
      title: "6. Customer Communication Policy",
      content: "Sellers must respond to customer queries within 24 hours. All communication must be professional and respectful. Sharing personal contact details or directing customers off-platform is strictly prohibited."
    },
    {
      title: "7. Review & Rating Policy",
      content: "Sellers must not attempt to manipulate product reviews or ratings. Incentivizing customers to leave positive reviews is prohibited. Genuine negative reviews must be addressed professionally through the resolution center."
    },
    {
      title: "8. Commission & Fee Policy",
      content: "Platform commissions are deducted automatically from each sale. Commissions vary by product category and are displayed in the seller dashboard. Additional fees may apply for promotional placements or premium features."
    },
    {
      title: "9. Prohibited Items Policy",
      content: "Sellers must not list counterfeit goods, stolen products, hazardous materials, adult content, or any items that violate local, state, or national laws. Violations will result in immediate account termination and legal action if necessary."
    },
    {
      title: "10. Account Suspension Policy",
      content: "Accounts may be suspended for policy violations, high cancellation rates, negative customer feedback, or fraudulent activity. Suspended sellers will be notified via email with reasons and appeal options."
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <SEO 
        title="Seller Policies | Merchant Guidelines"
        description="Read the official seller guidelines, listing rules, shipping policies, and account rules for selling on Shopidoo."
        canonicalUrl="https://seller.shopidoo.in/seller-policies"
      />
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
            Seller Policies
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
            Last updated: June 2025 &nbsp;|&nbsp; These policies apply to all registered sellers.
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Intro */}
        <Box sx={{ backgroundColor: '#e0f7f6', borderRadius: '12px', p: 3, mb: 4 }}>
          <Typography sx={{ color: '#065f46', fontSize: '14px', lineHeight: 1.8 }}>
            Our seller policies are designed to ensure a fair, safe, and trustworthy marketplace
            for both sellers and customers. Violation of any policy may result in account suspension or termination.
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
            For policy-related queries, contact us at{' '}
            <Box component="span" sx={{ fontWeight: 600, color: '#0B8457' }}>support@yourplatform.com</Box>
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}