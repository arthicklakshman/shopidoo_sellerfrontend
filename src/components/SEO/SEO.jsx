import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Reusable SEO Helper Component for Shopidoo Seller Portal
 */
export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  noIndex = false,
}) {
  const pageTitle = title
    ? `${title} | Shopidoo Seller Portal`
    : 'Sell on Shopidoo - Merchant Portal';
  const defaultDesc =
    'Grow your business by selling on Shopidoo. Low commissions, easy product management, and fast merchant payouts.';

  return (
    <Helmet>
      {/* Title and Description */}
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Search Engine Privacy Rules */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
    </Helmet>
  );
}
