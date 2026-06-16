// Resolves a stored upload path (e.g. "/uploads/abc.png") into a browser-openable URL.
//
// In production VITE_API_URL is "/api/v1" (a relative path), so the base resolves to ""
// and we return a relative "/uploads/..." URL that Vercel rewrites proxy to the backend.
// In development VITE_API_URL is the absolute localhost backend origin.
//
// NOTE: the fallback must be applied to VITE_API_URL *before* stripping "/api/v1".
// Stripping first yields an empty string in production, which is falsy and would
// incorrectly trigger a "http://localhost:4000" fallback.
export const getUploadUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
  const base = apiUrl.replace('/api/v1', '');

  return `${base}${path.startsWith('/') ? '' : '/'}${path.replace(/\\/g, '/')}`;
};