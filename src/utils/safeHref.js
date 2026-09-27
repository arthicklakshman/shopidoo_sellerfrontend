/**
 * Returns `url` only if it is a safe http(s)/relative link, otherwise
 * `undefined`. Use this before putting any user- or seller-supplied string
 * into an <a href> (or MUI `component="a"` `href`) — without it, a value
 * like `javascript:...` would execute when a customer/seller/admin clicks
 * the link. See SECURITY_AUDIT.md #5.
 */
export function safeHref(url) {
  if (!url || typeof url !== 'string') return undefined;

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // Not a parseable URL at all — treat as unsafe.
  }

  return undefined;
}
