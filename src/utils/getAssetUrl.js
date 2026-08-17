/**
 * Converts asset path/URL into a valid display URL.
 * @param {string} path - Image or asset path/URL
 * @returns {string} - Formatted asset URL
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : '';

  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
};