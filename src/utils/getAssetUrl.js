const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Strip a trailing /api/v1 (or /api/v2, etc.) to get the bare server origin
export const ASSET_BASE = API_BASE.replace(/\/api\/v\d+\/?$/, '');

export const getAssetUrl = (path) => {
  if (!path) return path;
  if (/^(https?:|blob:|data:)/i.test(path)) return path; // already absolute or a local blob preview
  return `${ASSET_BASE}${path}`;
};